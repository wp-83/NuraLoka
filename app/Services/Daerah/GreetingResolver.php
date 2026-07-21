<?php

namespace App\Services\Daerah;

use Illuminate\Http\Request;

/**
 * Orkestrator fitur sapaan bahasa daerah.
 *
 * Menggabungkan deteksi wilayah + pemetaan provinsi + rantai fallback menjadi
 * satu payload siap pakai untuk frontend.
 */
class GreetingResolver
{
    public function __construct(
        private readonly RegionDetector $detector,
        private readonly ProvinceMapper $mapper,
        private readonly GreetingRepository $greetings,
    ) {}

    /**
     * Payload untuk user yang sedang login (prioritas 1: provinsi tersimpan).
     * Dipakai HandleInertiaRequests agar sapaan sudah ada pada render pertama —
     * tanpa kedipan teks dan tanpa kerja tambahan di klien.
     */
    public function forUser(?object $user): array
    {
        // Pemaksaan untuk pengujian menang atas segalanya, termasuk provinsi
        // asli di profil user.
        $forced = $this->forced();

        if ($forced !== null) {
            return $forced;
        }

        $province = $this->detector->fromUser($user);

        return $this->build($province, $province !== null ? 'user_profile' : 'default');
    }

    /**
     * Payload yang dipaksa lewat .env atau query string, untuk memeriksa
     * tampilan sapaan tanpa berpindah lokasi. Selalu null di production.
     *
     * Menerima TIGA bentuk, karena ketiganya sama masuk akal saat menguji:
     *   - nama provinsi  : "Jawa Barat"
     *   - nama kota      : "Bandung"
     *   - nama bahasa    : "sunda"  (nama file di lang/daerah)
     *
     * Nama bahasa penting: saat memeriksa "apakah bahasa X sudah tampil", yang
     * ada di kepala adalah bahasanya, bukan provinsi mana yang memakainya.
     *
     * Mengembalikan null bila namanya tidak dikenal sama sekali, sehingga salah
     * ketik jatuh ke perilaku normal alih-alih menampilkan sapaan kosong.
     */
    public function forced(): ?array
    {
        $candidate = $this->forcedValue();

        if ($candidate === null) {
            return null;
        }

        // 1. Provinsi atau kota.
        if ($province = $this->mapper->resolveName($candidate)) {
            return $this->build($province, 'forced');
        }

        // 2. Nama bahasa daerah langsung.
        $language = $this->matchLanguage($candidate);

        if ($language !== null) {
            return $this->buildForLanguage($language, 'forced');
        }

        return null;
    }

    /** Nilai mentah pemaksaan: query string mengalahkan .env. */
    private function forcedValue(): ?string
    {
        if (! config('daerah.debug.enabled')) {
            return null;
        }

        $candidate = config('daerah.debug.force_province');

        $parameter = config('daerah.debug.query_parameter', 'daerah');
        $fromQuery = request()?->query($parameter);

        if (is_string($fromQuery) && $fromQuery !== '') {
            $candidate = $fromQuery;
        }

        return is_string($candidate) && trim($candidate) !== '' ? trim($candidate) : null;
    }

    /** Cocokkan dengan nama file di lang/daerah, tanpa peduli huruf besar/kecil. */
    private function matchLanguage(string $candidate): ?string
    {
        foreach ($this->greetings->availableLanguages() as $language) {
            if (strcasecmp($language, $candidate) === 0) {
                return $language;
            }
        }

        return null;
    }

    /**
     * Payload untuk satu bahasa daerah yang ditunjuk langsung, tanpa lewat
     * provinsi. Rantainya cukup bahasa itu sendiri lalu Bahasa Indonesia.
     */
    public function buildForLanguage(string $language, string $source = 'forced'): array
    {
        $chain = array_values(array_unique([
            $language,
            config('daerah.default', 'indonesia'),
        ]));

        return $this->assemble($chain, null, $source);
    }

    /** Payload dari koordinat Geolocation browser (prioritas 2). */
    public function forCoordinates(float $latitude, float $longitude): array
    {
        $province = $this->detector->fromCoordinates($latitude, $longitude);

        return $this->build($province, $province !== null ? 'geolocation' : 'default');
    }

    /** Payload dari geolokasi berbasis IP (prioritas 3). */
    public function forIp(Request $request): array
    {
        $province = $this->detector->fromIp($request);

        return $this->build($province, $province !== null ? 'ip' : 'default');
    }

    /**
     * Rakit payload lengkap untuk sebuah provinsi.
     *
     * Fallback dilakukan PER KUNCI, bukan per bahasa: bila bahasa provinsi baru
     * menerjemahkan sebagian kunci, kunci yang sudah ada tetap tampil dalam
     * bahasa daerah dan hanya sisanya yang mundur ke bahasa pulau lalu Indonesia.
     * Jadi provinsi mana pun selalu mendapat sapaan yang relevan secara budaya.
     */
    public function build(?string $province, string $source = 'default'): array
    {
        return $this->assemble(
            $this->mapper->chainFor($province),
            $province,
            $source,
        );
    }

    /**
     * Rakit payload dari sebuah rantai bahasa.
     *
     * Fallback dilakukan PER KUNCI, bukan per bahasa: bahasa pertama yang punya
     * sebuah kunci akan memenangkannya, lalu sisanya diisi bahasa berikutnya.
     */
    private function assemble(array $chain, ?string $province, string $source): array
    {
        $phrases = [];
        $resolvedFrom = [];

        foreach ($chain as $language) {
            foreach ($this->greetings->all($language) as $key => $value) {
                if (! array_key_exists($key, $phrases)) {
                    $phrases[$key] = $value;
                    $resolvedFrom[$key] = $language;
                }
            }
        }

        return [
            'province' => $province,
            'island' => $this->mapper->islandFor($province),
            // Bahasa paling spesifik pada rantai — dipakai menandai bahasa
            // aktif di UI (mis. atribut lang / tooltip).
            'language' => $chain[0],
            'chain' => $chain,
            'source' => $source,
            'phrases' => $phrases,
            'resolved_from' => $resolvedFrom,
        ];
    }
}
