<?php

namespace App\Console\Commands;

use App\Models\OsmPlace;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportOsmPlaces extends Command
{
    /**
     * Contoh:
     *   php artisan osm:import --region=jateng
     *   php artisan osm:import --south=-7.1 --west=109.0 --north=-6.8 --east=109.4
     *   php artisan osm:import --region=indonesia --tile=0.5 --sleep=3
     */
    protected $signature = 'osm:import
        {--region= : Preset area: jateng|jabar|jatim|bali|jakarta|indonesia}
        {--south= : Batas selatan (lat)}
        {--west= : Batas barat (lng)}
        {--north= : Batas utara (lat)}
        {--east= : Batas timur (lng)}
        {--tile=0.5 : Ukuran petak (derajat) per query Overpass}
        {--sleep=2 : Jeda detik antar petak (hormati rate-limit)}';

    protected $description = 'Impor POI dari Overpass (OSM) ke tabel osm_places (server-side, sekali jalan).';

    // Preset bounding box [south, west, north, east]
    private array $regions = [
        'jakarta'   => [-6.40, 106.60, -6.05, 107.05],
        'jabar'     => [-7.85, 106.30, -5.90, 108.85],
        'jateng'    => [-8.30, 108.55, -6.00, 111.70],
        'jatim'     => [-8.80, 110.80, -6.75, 114.60],
        'bali'      => [-8.90, 114.40, -8.05, 115.75],
        'indonesia' => [-11.00, 95.00, 6.10, 141.10],
    ];

    private array $endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
    ];

    public function handle(): int
    {
        [$south, $west, $north, $east] = $this->resolveBounds();
        if ($south === null) {
            return self::FAILURE;
        }

        $tile = (float) $this->option('tile');
        $sleep = (float) $this->option('sleep');

        $this->info("Impor OSM untuk bbox [{$south}, {$west}, {$north}, {$east}] — petak {$tile}°");

        $totalTiles = (int) (ceil(($north - $south) / $tile) * ceil(($east - $west) / $tile));
        $bar = $this->output->createProgressBar($totalTiles);
        $bar->start();

        $imported = 0;
        $failedTiles = 0;

        for ($lat = $south; $lat < $north; $lat += $tile) {
            for ($lng = $west; $lng < $east; $lng += $tile) {
                $tSouth = $lat;
                $tNorth = min($lat + $tile, $north);
                $tWest = $lng;
                $tEast = min($lng + $tile, $east);

                $elements = $this->fetchTile($tSouth, $tWest, $tNorth, $tEast);
                if ($elements === null) {
                    $failedTiles++;
                } else {
                    $imported += $this->storeElements($elements);
                }

                $bar->advance();
                if ($sleep > 0) {
                    usleep((int) ($sleep * 1_000_000));
                }
            }
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Selesai. Titik tersimpan/diperbarui: {$imported}. Petak gagal: {$failedTiles}.");
        $this->line('Total osm_places sekarang: '.OsmPlace::count());

        return self::SUCCESS;
    }

    private function resolveBounds(): array
    {
        $region = $this->option('region');
        if ($region) {
            $key = strtolower($region);
            if (! isset($this->regions[$key])) {
                $this->error("Region '{$region}' tidak dikenal. Pilihan: ".implode(', ', array_keys($this->regions)));
                return [null, null, null, null];
            }
            return $this->regions[$key];
        }

        foreach (['south', 'west', 'north', 'east'] as $opt) {
            if ($this->option($opt) === null) {
                $this->error('Sertakan --region ATAU keempat batas --south --west --north --east.');
                return [null, null, null, null];
            }
        }

        return [
            (float) $this->option('south'),
            (float) $this->option('west'),
            (float) $this->option('north'),
            (float) $this->option('east'),
        ];
    }

    /** Coba tiap mirror Overpass berurutan; kembalikan array elements atau null bila semua gagal. */
    private function fetchTile(float $south, float $west, float $north, float $east): ?array
    {
        $query = $this->buildQuery($south, $west, $north, $east);

        foreach ($this->endpoints as $endpoint) {
            try {
                // User-Agent WAJIB: tanpa ini Overpass menolak dengan HTTP 406.
                $response = Http::timeout(90)
                    ->withHeaders(['User-Agent' => 'NuraLoka-POI-Importer/1.0 (Laravel)'])
                    ->asForm()
                    ->post($endpoint, ['data' => $query]);
                if ($response->successful()) {
                    return $response->json('elements', []);
                }
            } catch (\Throwable $e) {
                // mirror gagal/timeout → coba berikutnya
            }
        }

        return null;
    }

    /** Simpan/parbarui elements ke osm_places; kembalikan jumlah baris valid. */
    private function storeElements(array $elements): int
    {
        $rows = [];
        $now = now();

        foreach ($elements as $el) {
            if (($el['type'] ?? null) !== 'node') {
                continue;
            }
            $tags = $el['tags'] ?? [];
            $name = $tags['name'] ?? $tags['name:id'] ?? $tags['name:en'] ?? null;
            $category = $this->categorize($tags);
            if (! $name || ! $category) {
                continue;
            }

            $rows[] = [
                'osm_id' => $el['id'],
                'name' => mb_substr($name, 0, 255),
                'latitude' => $el['lat'],
                'longitude' => $el['lon'],
                'address' => $tags['addr:full'] ?? $tags['addr:street'] ?? null,
                'category' => $category,
                'subtype' => $tags['amenity'] ?? $tags['tourism'] ?? $tags['natural']
                    ?? $tags['leisure'] ?? $tags['historic'] ?? $tags['waterway']
                    ?? $tags['shop'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (empty($rows)) {
            return 0;
        }

        // Idempotent: baris dengan osm_id sama akan di-update, bukan diduplikasi.
        foreach (array_chunk($rows, 500) as $chunk) {
            OsmPlace::upsert(
                $chunk,
                ['osm_id'],
                ['name', 'latitude', 'longitude', 'address', 'category', 'subtype', 'updated_at']
            );
        }

        return count($rows);
    }

    private function categorize(array $tags): ?string
    {
        $amenity = $tags['amenity'] ?? null;
        $tourism = $tags['tourism'] ?? null;
        $natural = $tags['natural'] ?? null;

        if (in_array($amenity, ['restaurant', 'cafe', 'food_court', 'fast_food'], true)) return 'Kuliner';
        if ($tourism === 'museum') return 'Museum';
        if ($natural === 'beach') return 'Pantai';
        if ($natural === 'waterfall' || ($tags['waterway'] ?? null) === 'waterfall') return 'Air Terjun';
        if (in_array($natural, ['peak', 'volcano'], true)
            || ($tags['leisure'] ?? null) === 'nature_reserve'
            || in_array($tourism, ['viewpoint', 'attraction'], true)) return 'Wisata Alam';
        if (($tags['leisure'] ?? null) === 'theme_park') return 'Taman Hiburan';
        if (isset($tags['historic'])) return 'Wisata Budaya';
        if ($amenity === 'place_of_worship') return 'Religi';
        if (in_array($tags['shop'] ?? null, ['mall', 'department_store'], true)) return 'Belanja';

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
