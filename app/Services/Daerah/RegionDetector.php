<?php

namespace App\Services\Daerah;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Works out which province a visitor is in. The order of preference belongs to
 * the caller (GreetingResolver); this class only supplies the means.
 *
 *   1. the user's saved province      → fromUser()
 *   2. browser Geolocation coordinates → fromCoordinates()
 *   3. IP-based geolocation            → fromIp()
 */
class RegionDetector
{
    /** The province on the signed-in user's profile. */
    public function fromUser(?object $user): ?string
    {
        if ($user === null) {
            return null;
        }

        $user->loadMissing('userDetail.province');

        return $user->userDetail?->province?->name;
    }

    /**
     * The province a pair of coordinates falls in.
     *
     * Two stages:
     *   1. province bounding boxes — accurate for cities near a border;
     *   2. nearest centroid — the fallback when the point is in no box at all.
     *
     * Deliberately uses local data rather than third-party reverse geocoding: no
     * user coordinate ever leaves the server, and there is no network dependency.
     */
    public function fromCoordinates(float $latitude, float $longitude): ?string
    {
        return $this->fromBounds($latitude, $longitude)
            ?? $this->fromNearestCentroid($latitude, $longitude);
    }

    /**
     * The province whose bounding box contains this point.
     *
     * When the point falls inside several boxes (provinces do overlap, and DKI
     * Jakarta is entirely surrounded by Jawa Barat and Banten), the SMALLEST box
     * wins — that is the most specific province containing the point.
     */
    private function fromBounds(float $latitude, float $longitude): ?string
    {
        $match = null;
        $smallestArea = INF;

        foreach (config('daerah.province_bounds', []) as $province => $bounds) {
            [$latMin, $lngMin, $latMax, $lngMax] = $bounds;

            if ($latitude < $latMin || $latitude > $latMax) {
                continue;
            }

            if ($longitude < $lngMin || $longitude > $lngMax) {
                continue;
            }

            $area = ($latMax - $latMin) * ($lngMax - $lngMin);

            if ($area < $smallestArea) {
                $smallestArea = $area;
                $match = $province;
            }
        }

        return $match;
    }

    /** The nearest province centroid, bounded by a sane radius. */
    private function fromNearestCentroid(float $latitude, float $longitude): ?string
    {
        $nearest = null;
        $shortest = INF;

        foreach (config('daerah.province_coordinates', []) as $province => [$lat, $lng]) {
            $distance = $this->haversineKm($latitude, $longitude, $lat, $lng);

            if ($distance < $shortest) {
                $shortest = $distance;
                $nearest = $province;
            }
        }

        $limit = config('daerah.detection.max_distance_km', 500);

        // Beyond a sane radius → almost certainly not in Indonesia at all.
        return $shortest <= $limit ? $nearest : null;
    }

    /**
     * The province behind an IP address. Disabled by default because it requires
     * a call to a third-party service (the visitor's IP leaves the server).
     */
    public function fromIp(Request $request): ?string
    {
        $config = config('daerah.detection.ip_lookup');

        if (! ($config['enabled'] ?? false)) {
            return null;
        }

        $ip = $request->ip();

        if ($ip === null || $this->isPrivateIp($ip)) {
            return null;
        }

        return Cache::remember(
            'daerah.ip.'.$ip,
            $config['cache_ttl'] ?? 86400,
            function () use ($config, $ip) {
                try {
                    $response = Http::timeout($config['timeout'] ?? 2)
                        ->get(str_replace('{ip}', $ip, $config['endpoint']));

                    if (! $response->successful()) {
                        return null;
                    }

                    $payload = $response->json();

                    if (($payload['countryCode'] ?? null) !== 'ID') {
                        return null;
                    }

                    // The region name is the more trustworthy field, but some
                    // services return only a city — which used to be thrown away.
                    return $this->normaliseProvinceName((string) ($payload['regionName'] ?? ''))
                        ?? app(ProvinceMapper::class)->resolveName((string) ($payload['city'] ?? ''));
                } catch (\Throwable $e) {
                    // Location detection is a nicety — a failure must not fail
                    // the request. Falling back to Indonesian is enough.
                    Log::debug('Daerah IP lookup failed: '.$e->getMessage());

                    return null;
                }
            }
        );
    }

    /**
     * Reconcile the province naming used by an external service with the names
     * in the provinces table (e.g. "West Java" → "Jawa Barat", "Special Region
     * of Yogyakarta" → "DI Yogyakarta").
     */
    private function normaliseProvinceName(string $name): ?string
    {
        $name = trim($name);

        if ($name === '') {
            return null;
        }

        $known = array_keys(config('daerah.province_island', []));

        foreach ($known as $province) {
            if (strcasecmp($province, $name) === 0) {
                return $province;
            }
        }

        $aliases = [
            'west java' => 'Jawa Barat',
            'central java' => 'Jawa Tengah',
            'east java' => 'Jawa Timur',
            'special region of yogyakarta' => 'DI Yogyakarta',
            'yogyakarta' => 'DI Yogyakarta',
            'jakarta' => 'DKI Jakarta',
            'jakarta raya' => 'DKI Jakarta',
            'west sumatra' => 'Sumatera Barat',
            'north sumatra' => 'Sumatera Utara',
            'south sumatra' => 'Sumatera Selatan',
            'west kalimantan' => 'Kalimantan Barat',
            'central kalimantan' => 'Kalimantan Tengah',
            'south kalimantan' => 'Kalimantan Selatan',
            'east kalimantan' => 'Kalimantan Timur',
            'north kalimantan' => 'Kalimantan Utara',
            'north sulawesi' => 'Sulawesi Utara',
            'central sulawesi' => 'Sulawesi Tengah',
            'south sulawesi' => 'Sulawesi Selatan',
            'southeast sulawesi' => 'Sulawesi Tenggara',
            'west sulawesi' => 'Sulawesi Barat',
            'west nusa tenggara' => 'Nusa Tenggara Barat',
            'east nusa tenggara' => 'Nusa Tenggara Timur',
            'bangka belitung islands' => 'Kepulauan Bangka Belitung',
            'riau islands' => 'Kepulauan Riau',
            'north maluku' => 'Maluku Utara',
            'west papua' => 'Papua Barat',
        ];

        return $aliases[mb_strtolower($name)] ?? null;
    }

    /** Great-circle distance between two points, in kilometres. */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * asin(min(1.0, sqrt($a)));
    }

    private function isPrivateIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }
}
