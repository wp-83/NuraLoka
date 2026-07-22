<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Place;
use App\Models\PlaceOsmRef;
use Illuminate\Support\Facades\Http;

/**
 * The core of importing POIs from Overpass (OSM) into the `places` table
 * (source='osm').
 *
 * Each OSM node becomes one Place, while its OSM identity and metadata (osm_id,
 * subtype) live separately in `place_osm_refs`. That keeps `places` clean and
 * makes the import idempotent: re-importing the same node updates it rather than
 * creating a duplicate.
 *
 * Shared by:
 *  - the CLI command App\Console\Commands\ImportOsmPlaces (one synchronous run
 *    through import());
 *  - the queued job App\Jobs\ImportOsmTileJob (one job per tile, triggered from
 *    the admin panel).
 */
class OsmImportService
{
    /** Category ids cached by name, built once per import process. */
    private array $categoryIdCache = [];

    // Area presets: slug => ['label' => display name, 'bbox' => [south, west, north, east]].
    // Covers Indonesia's 38 provinces (matching ProvinceSeeder) plus a whole-country
    // option. The bounding boxes are approximate, which is accurate enough to bound
    // an Overpass import.
    public const REGIONS = [
        // ── Sumatera ──
        'aceh' => ['label' => 'Aceh', 'bbox' => [2.00, 95.00, 6.10, 98.40]],
        'sumatera-utara' => ['label' => 'Sumatera Utara', 'bbox' => [0.50, 97.00, 4.40, 100.50]],
        'sumatera-barat' => ['label' => 'Sumatera Barat', 'bbox' => [-3.40, 98.50, 0.90, 101.90]],
        'riau' => ['label' => 'Riau', 'bbox' => [-0.50, 100.00, 2.60, 103.60]],
        'kepulauan-riau' => ['label' => 'Kepulauan Riau', 'bbox' => [-1.00, 103.00, 4.90, 109.50]],
        'jambi' => ['label' => 'Jambi', 'bbox' => [-2.80, 101.00, -0.70, 104.60]],
        'sumatera-selatan' => ['label' => 'Sumatera Selatan', 'bbox' => [-5.00, 102.00, -1.40, 106.10]],
        'kepulauan-bangka-belitung' => ['label' => 'Kepulauan Bangka Belitung', 'bbox' => [-3.40, 105.00, -1.50, 108.80]],
        'bengkulu' => ['label' => 'Bengkulu', 'bbox' => [-5.50, 100.80, -2.20, 104.00]],
        'lampung' => ['label' => 'Lampung', 'bbox' => [-6.10, 103.40, -3.70, 106.10]],

        // ── Jawa ──
        'dki-jakarta' => ['label' => 'DKI Jakarta', 'bbox' => [-6.40, 106.60, -6.05, 107.05]],
        'jawa-barat' => ['label' => 'Jawa Barat', 'bbox' => [-7.85, 106.30, -5.90, 108.85]],
        'banten' => ['label' => 'Banten', 'bbox' => [-7.00, 105.00, -5.80, 106.80]],
        'jawa-tengah' => ['label' => 'Jawa Tengah', 'bbox' => [-8.30, 108.55, -6.00, 111.70]],
        'di-yogyakarta' => ['label' => 'DI Yogyakarta', 'bbox' => [-8.20, 110.00, -7.50, 110.85]],
        'jawa-timur' => ['label' => 'Jawa Timur', 'bbox' => [-8.80, 110.80, -6.75, 114.60]],

        // ── Bali & Nusa Tenggara ──
        'bali' => ['label' => 'Bali', 'bbox' => [-8.90, 114.40, -8.05, 115.75]],
        'nusa-tenggara-barat' => ['label' => 'Nusa Tenggara Barat', 'bbox' => [-9.20, 115.80, -8.00, 119.40]],
        'nusa-tenggara-timur' => ['label' => 'Nusa Tenggara Timur', 'bbox' => [-11.00, 118.90, -8.00, 125.20]],

        // ── Kalimantan ──
        'kalimantan-barat' => ['label' => 'Kalimantan Barat', 'bbox' => [-3.10, 108.60, 2.10, 114.30]],
        'kalimantan-tengah' => ['label' => 'Kalimantan Tengah', 'bbox' => [-3.60, 110.90, 0.10, 115.90]],
        'kalimantan-selatan' => ['label' => 'Kalimantan Selatan', 'bbox' => [-4.80, 114.30, -1.30, 116.60]],
        'kalimantan-timur' => ['label' => 'Kalimantan Timur', 'bbox' => [-1.50, 113.50, 2.60, 119.00]],
        'kalimantan-utara' => ['label' => 'Kalimantan Utara', 'bbox' => [1.90, 114.60, 4.30, 118.30]],

        // ── Sulawesi ──
        'sulawesi-utara' => ['label' => 'Sulawesi Utara', 'bbox' => [0.20, 123.00, 5.60, 127.80]],
        'gorontalo' => ['label' => 'Gorontalo', 'bbox' => [0.20, 121.00, 1.10, 123.50]],
        'sulawesi-tengah' => ['label' => 'Sulawesi Tengah', 'bbox' => [-3.70, 119.30, 1.40, 124.50]],
        'sulawesi-barat' => ['label' => 'Sulawesi Barat', 'bbox' => [-3.50, 118.70, -0.80, 119.90]],
        'sulawesi-selatan' => ['label' => 'Sulawesi Selatan', 'bbox' => [-7.40, 118.70, -1.90, 121.50]],
        'sulawesi-tenggara' => ['label' => 'Sulawesi Tenggara', 'bbox' => [-6.50, 120.70, -1.90, 124.60]],

        // ── Maluku ──
        'maluku' => ['label' => 'Maluku', 'bbox' => [-8.50, 125.00, -2.90, 135.00]],
        'maluku-utara' => ['label' => 'Maluku Utara', 'bbox' => [-2.90, 123.80, 3.00, 129.90]],

        // ── Papua ──
        'papua' => ['label' => 'Papua', 'bbox' => [-4.30, 138.50, 0.50, 141.10]],
        'papua-barat' => ['label' => 'Papua Barat', 'bbox' => [-3.50, 131.00, 0.00, 134.50]],
        'papua-selatan' => ['label' => 'Papua Selatan', 'bbox' => [-9.20, 137.50, -5.00, 141.10]],
        'papua-tengah' => ['label' => 'Papua Tengah', 'bbox' => [-4.90, 135.00, -2.40, 138.50]],
        'papua-pegunungan' => ['label' => 'Papua Pegunungan', 'bbox' => [-5.20, 137.50, -3.20, 141.00]],
        'papua-barat-daya' => ['label' => 'Papua Barat Daya', 'bbox' => [-2.00, 129.00, 1.10, 133.00]],

        // ── Seluruh negara ──
        'indonesia' => ['label' => 'Seluruh Indonesia', 'bbox' => [-11.00, 95.00, 6.10, 141.10]],
    ];

    private array $endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
    ];

    /** A preset region's bounding box [south, west, north, east], or null if unknown. */
    public function boundsForRegion(string $region): ?array
    {
        return self::REGIONS[strtolower($region)]['bbox'] ?? null;
    }

    /** How many Overpass tiles a bbox needs at a given tile size. */
    public function totalTiles(float $south, float $west, float $north, float $east, float $tile): int
    {
        return (int) (ceil(($north - $south) / $tile) * ceil(($east - $west) / $tile));
    }

    /**
     * Split a bbox into tiles of $tile degrees.
     *
     * @return array<int, array{south:float, west:float, north:float, east:float}>
     */
    public function tiles(float $south, float $west, float $north, float $east, float $tile = 0.5): array
    {
        $tiles = [];
        for ($lat = $south; $lat < $north; $lat += $tile) {
            for ($lng = $west; $lng < $east; $lng += $tile) {
                $tiles[] = [
                    'south' => $lat,
                    'west' => $lng,
                    'north' => min($lat + $tile, $north),
                    'east' => min($lng + $tile, $east),
                ];
            }
        }

        return $tiles;
    }

    /**
     * Import ONE tile: fetch from Overpass, then store. Returns the number of
     * valid nodes.
     *
     * Throws when every Overpass mirror fails, so the caller (the queued job) can
     * retry this tile without failing the whole import.
     */
    public function importTile(float $south, float $west, float $north, float $east): int
    {
        $elements = $this->fetchTile($south, $west, $north, $east);
        if ($elements === null) {
            throw new \RuntimeException('Overpass failed for tile ['."$south,$west,$north,$east".'].');
        }

        return $this->storeElements($elements);
    }

    /**
     * Run the import for a bbox, split into tiles of $tile degrees.
     *
     * @param  callable|null  $onProgress  fn(int $tileIndex, int $totalTiles, int $importedSoFar): void
     * @return array{imported:int, failedTiles:int, totalTiles:int}
     */
    public function import(
        float $south,
        float $west,
        float $north,
        float $east,
        float $tile = 0.5,
        float $sleep = 2,
        ?callable $onProgress = null
    ): array {
        $tiles = $this->tiles($south, $west, $north, $east, $tile);
        $totalTiles = count($tiles);
        $imported = 0;
        $failedTiles = 0;
        $tileIndex = 0;

        foreach ($tiles as $t) {
            try {
                $imported += $this->importTile($t['south'], $t['west'], $t['north'], $t['east']);
            } catch (\Throwable $e) {
                $failedTiles++;
            }

            $tileIndex++;
            if ($onProgress) {
                $onProgress($tileIndex, $totalTiles, $imported);
            }

            if ($sleep > 0) {
                usleep((int) ($sleep * 1_000_000));
            }
        }

        return [
            'imported' => $imported,
            'failedTiles' => $failedTiles,
            'totalTiles' => $totalTiles,
        ];
    }

    /** Try each Overpass mirror in turn; returns the elements, or null if all fail. */
    private function fetchTile(float $south, float $west, float $north, float $east): ?array
    {
        $query = $this->buildQuery($south, $west, $north, $east);

        foreach ($this->endpoints as $endpoint) {
            try {
                // The User-Agent is REQUIRED: without it Overpass answers HTTP 406.
                $response = Http::timeout(90)
                    ->withHeaders(['User-Agent' => 'NuraLoka-POI-Importer/1.0 (Laravel)'])
                    ->asForm()
                    ->post($endpoint, ['data' => $query]);
                if ($response->successful()) {
                    return $response->json('elements', []);
                }
            } catch (\Throwable $e) {
                // mirror failed or timed out — try the next one
            }
        }

        return null;
    }

    /**
     * Store or update elements into `places` (source='osm') and `place_osm_refs`.
     * Returns the number of valid nodes processed.
     *
     * Idempotent through place_osm_refs.osm_id: a node already imported updates
     * its Place rather than adding a row. Place attributes with no OSM equivalent
     * (description, for one) are left null.
     */
    private function storeElements(array $elements): int
    {
        $processed = 0;

        foreach ($elements as $el) {
            if (($el['type'] ?? null) !== 'node') {
                continue;
            }
            $tags = $el['tags'] ?? [];
            $name = $tags['name'] ?? $tags['name:id'] ?? $tags['name:en'] ?? null;
            $categoryName = $this->categorize($tags);
            if (! $name || ! $categoryName) {
                continue;
            }

            $osmId = (int) $el['id'];
            $subtype = $tags['amenity'] ?? $tags['tourism'] ?? $tags['natural']
                ?? $tags['leisure'] ?? $tags['historic'] ?? $tags['waterway']
                ?? $tags['shop'] ?? null;

            $attributes = [
                'name' => mb_substr($name, 0, 255),
                'latitude' => $el['lat'],
                'longitude' => $el['lon'],
                'address' => $tags['addr:full'] ?? $tags['addr:street'] ?? null,
                // No OSM equivalent — left null by design.
                'description' => null,
                'source' => 'osm',
            ];

            $ref = PlaceOsmRef::where('osm_id', $osmId)->first();

            if ($ref) {
                // Already imported — update the place and its OSM metadata.
                $place = Place::find($ref->place_id);
                if ($place) {
                    $place->fill($attributes)->save();
                    $ref->update(['subtype' => $subtype]);
                    $place->categories()->syncWithoutDetaching([$this->categoryId($categoryName)]);
                }
            } else {
                // New node — create the place (HasSlug makes the slug unique) and
                // its OSM reference.
                $place = Place::create($attributes);
                PlaceOsmRef::create([
                    'place_id' => $place->id,
                    'osm_id' => $osmId,
                    'subtype' => $subtype,
                ]);
                $place->categories()->attach($this->categoryId($categoryName));
            }

            $processed++;
        }

        return $processed;
    }

    /** Resolve (and cache) a Category id by name, creating it when absent. */
    private function categoryId(string $name): int
    {
        return $this->categoryIdCache[$name] ??= Category::firstOrCreate(['name' => $name])->id;
    }

    private function categorize(array $tags): ?string
    {
        $amenity = $tags['amenity'] ?? null;
        $tourism = $tags['tourism'] ?? null;
        $natural = $tags['natural'] ?? null;

        if (in_array($amenity, ['restaurant', 'cafe', 'food_court', 'fast_food'], true)) {
            return 'Kuliner';
        }
        if ($tourism === 'museum') {
            return 'Museum';
        }
        if ($natural === 'beach') {
            return 'Pantai';
        }
        if ($natural === 'waterfall' || ($tags['waterway'] ?? null) === 'waterfall') {
            return 'Air Terjun';
        }
        if (in_array($natural, ['peak', 'volcano'], true)
            || ($tags['leisure'] ?? null) === 'nature_reserve'
            || in_array($tourism, ['viewpoint', 'attraction'], true)) {
            return 'Wisata Alam';
        }
        if (($tags['leisure'] ?? null) === 'theme_park') {
            return 'Taman Hiburan';
        }
        if (isset($tags['historic'])) {
            return 'Wisata Budaya';
        }
        if ($amenity === 'place_of_worship') {
            return 'Religi';
        }
        if (in_array($tags['shop'] ?? null, ['mall', 'department_store'], true)) {
            return 'Belanja';
        }

        return null;
    }

    private function buildQuery(float $south, float $west, float $north, float $east): string
    {
        $bbox = "{$south},{$west},{$north},{$east}";

        return <<<QUERY
[out:json][timeout:60];
(
  node["amenity"="restaurant"]["name"]({$bbox});
  node["amenity"="cafe"]["name"]({$bbox});
  node["amenity"="food_court"]["name"]({$bbox});
  node["amenity"="fast_food"]["name"]({$bbox});
  node["tourism"="museum"]["name"]({$bbox});
  node["tourism"="viewpoint"]["name"]({$bbox});
  node["tourism"="attraction"]["name"]({$bbox});
  node["natural"="beach"]["name"]({$bbox});
  node["natural"="peak"]["name"]({$bbox});
  node["natural"="waterfall"]["name"]({$bbox});
  node["waterway"="waterfall"]["name"]({$bbox});
  node["leisure"="theme_park"]["name"]({$bbox});
  node["leisure"="nature_reserve"]["name"]({$bbox});
  node["historic"]["name"]({$bbox});
  node["amenity"="place_of_worship"]["name"]({$bbox});
  node["shop"="mall"]["name"]({$bbox});
  node["shop"="department_store"]["name"]({$bbox});
);
out body;
QUERY;
    }
}
