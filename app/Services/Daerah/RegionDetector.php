<?php

namespace App\Services\Daerah;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Menentukan provinsi pengunjung. Urutan prioritas dipegang oleh pemanggil
 * (GreetingResolver); kelas ini hanya menyediakan cara-caranya.
 *
 *   1. provinsi tersimpan milik user  → fromUser()
 *   2. koordinat Geolocation browser  → fromCoordinates()
 *   3. geolokasi berbasis IP          → fromIp()
 */
class RegionDetector
{
    /** Provinsi dari profil user yang sedang login. */
    public function fromUser(?object $user): ?string
    {
        if ($user === null) {
            return null;
        }

        $user->loadMissing('userDetail.province');

        return $user->userDetail?->province?->name;
    }

    /**
     * Provinsi dari koordinat.
     *
     * Dua tahap:
     *   1. kotak batas provinsi — akurat untuk kota dekat perbatasan;
     *   2. centroid terdekat — cadangan bila titik tidak masuk kotak mana pun.
     *
     * Disengaja memakai data lokal, bukan reverse-geocoding pihak ketiga: tidak
     * ada koordinat pengguna yang dikirim keluar dan tidak ada ketergantungan
     * jaringan.
     */
    public function fromCoordinates(float $latitude, float $longitude): ?string
    {
        return $this->fromBounds($latitude, $longitude)
            ?? $this->fromNearestCentroid($latitude, $longitude);
    }

    /**
     * Provinsi yang kotak batasnya memuat titik ini.
     *
     * Bila titik masuk ke beberapa kotak (provinsi memang bisa tumpang tindih,
     * dan DKI Jakarta sepenuhnya dikelilingi Jawa Barat & Banten), dipilih kotak
     * TERKECIL — yaitu provinsi paling spesifik yang memuat titik tersebut.
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

    /** Centroid provinsi terdekat, dibatasi radius wajar. */
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

        // Di luar radius wajar → kemungkinan besar bukan di Indonesia.
        return $shortest <= $limit ? $nearest : null;
    }

    /**
     * Provinsi dari alamat IP. Nonaktif secara default karena memerlukan
     * panggilan ke layanan pihak ketiga (IP pengunjung dikirim keluar).
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

                    // Nama wilayah lebih dipercaya, tapi sebagian layanan hanya
                    // mengembalikan kota — dulu itu terbuang percuma.
                    return $this->normaliseProvinceName((string) ($payload['regionName'] ?? ''))
                        ?? app(ProvinceMapper::class)->resolveName((string) ($payload['city'] ?? ''));
                } catch (\Throwable $e) {
                    // Deteksi lokasi bersifat pelengkap — kegagalan tidak boleh
                    // menggagalkan request. Cukup mundur ke Bahasa Indonesia.
                    Log::debug('Daerah IP lookup gagal: '.$e->getMessage());

                    return null;
                }
            }
        );
    }

    /**
     * Samakan penamaan provinsi dari layanan luar dengan nama di tabel provinces
     * (mis. "West Java" / "Jawa Barat", "Special Region of Yogyakarta").
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

    /** Jarak lingkaran besar antara dua titik, dalam kilometer. */
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
