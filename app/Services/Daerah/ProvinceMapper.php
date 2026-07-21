<?php

namespace App\Services\Daerah;

/**
 * Memetakan nama provinsi ke bahasa daerahnya, beserta fallback bertingkat:
 *
 *   1. bahasa khusus provinsi   (config daerah.provinces)
 *   2. bahasa utama pulau       (config daerah.province_island + daerah.islands)
 *
 * Bahasa Indonesia SENGAJA TIDAK ikut dalam rantai ini. Fitur ini menampilkan
 * bahasa daerah; begitu Indonesia diikutkan, provinsi yang terjemahannya belum
 * lengkap akan menampilkan teks Indonesia dan terlihat seperti fitur yang tidak
 * jalan. Karena itu batas terakhirnya adalah bahasa utama pulau.
 *
 * Konsekuensinya: setiap bahasa pulau di config daerah.islands WAJIB terisi
 * penuh — tanpa itu ada kunci yang tidak menghasilkan teks sama sekali.
 * `php artisan daerah:check` menjaga syarat ini.
 *
 * Bahasa Indonesia hanya dipakai bila wilayahnya benar-benar tidak diketahui
 * (tamu tanpa lokasi), yaitu saat $province === null.
 *
 * Mengembalikan RANTAI, bukan satu bahasa, supaya GreetingResolver bisa mundur
 * per-kunci: provinsi yang bahasanya baru diterjemahkan sebagian tetap memakai
 * frasa daerah untuk kunci yang ada, dan mundur hanya untuk kunci yang kosong.
 */
class ProvinceMapper
{
    /**
     * Rantai bahasa dari paling spesifik ke paling umum, tanpa duplikat.
     *
     * @return list<string>
     */
    public function chainFor(?string $province): array
    {
        // Wilayah tidak diketahui sama sekali — tidak ada pulau yang bisa
        // dijadikan acuan, jadi barulah Bahasa Indonesia dipakai.
        if ($province === null) {
            return [config('daerah.default', 'indonesia')];
        }

        $chain = [];

        $provinceLanguage = config('daerah.provinces')[$province] ?? null;

        if (is_string($provinceLanguage) && $provinceLanguage !== '') {
            $chain[] = $provinceLanguage;
        }

        $island = config('daerah.province_island')[$province] ?? null;
        $islandLanguage = $island ? (config('daerah.islands')[$island] ?? null) : null;

        if (is_string($islandLanguage) && $islandLanguage !== '') {
            $chain[] = $islandLanguage;
        }

        // Provinsi dikenal tapi tidak punya pulau/bahasa sama sekali (salah
        // konfigurasi). Jangan biarkan sapaan hilang total.
        if ($chain === []) {
            $chain[] = config('daerah.default', 'indonesia');
        }

        return array_values(array_unique($chain));
    }

    /** Bahasa paling spesifik untuk sebuah provinsi (tanpa memeriksa isi file). */
    public function languageFor(?string $province): string
    {
        return $this->chainFor($province)[0];
    }

    /** Pulau tempat provinsi berada, null bila tidak dikenal. */
    public function islandFor(?string $province): ?string
    {
        if ($province === null) {
            return null;
        }

        return config('daerah.province_island')[$province] ?? null;
    }

    /** Apakah nama provinsi dikenal sistem. */
    public function knows(?string $province): bool
    {
        return $province !== null
            && array_key_exists($province, config('daerah.province_island', []));
    }

    /**
     * Ubah nama bebas menjadi nama provinsi resmi.
     *
     * Menerima nama provinsi ("Jawa Barat") maupun nama kota ("Bandung"), tanpa
     * peduli huruf besar/kecil. Ini satu-satunya tempat penerjemahan nama, agar
     * pemaksaan lewat ?daerah=, geolokasi IP, dan perintah artisan memperlakukan
     * masukan dengan cara yang sama.
     *
     * Mengembalikan null bila nama tidak dikenal — pemanggil memutuskan sendiri
     * apakah itu berarti mundur ke default atau menampilkan pesan salah.
     */
    public function resolveName(?string $name): ?string
    {
        if ($name === null) {
            return null;
        }

        $name = trim($name);

        if ($name === '') {
            return null;
        }

        foreach (array_keys(config('daerah.province_island', [])) as $province) {
            if (strcasecmp($province, $name) === 0) {
                return $province;
            }
        }

        foreach (config('daerah.cities', []) as $city => $province) {
            if (strcasecmp($city, $name) === 0) {
                return $this->knows($province) ? $province : null;
            }
        }

        return null;
    }
}
