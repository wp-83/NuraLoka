<?php

namespace App\Console\Commands;

use App\Models\Province;
use App\Services\Daerah\GreetingRepository;
use App\Services\Daerah\GreetingResolver;
use App\Services\Daerah\ProvinceMapper;
use Illuminate\Console\Command;

/**
 * Memeriksa kesehatan fitur sapaan bahasa daerah.
 *
 *   php artisan daerah:check                        ringkasan semua provinsi
 *   php artisan daerah:check --province="Bali"      rincian satu provinsi
 *   php artisan daerah:check --coverage             kelengkapan tiap bahasa
 *
 * Keluar dengan kode 1 bila ada masalah, sehingga bisa dipakai di CI.
 */
class DaerahCheck extends Command
{
    protected $signature = 'daerah:check
        {--province= : Periksa satu provinsi, kota, atau bahasa secara rinci}
        {--coverage : Tampilkan kelengkapan terjemahan tiap bahasa}
        {--identical : Daftar frasa yang masih sama persis dengan Bahasa Indonesia}';

    protected $description = 'Periksa pemetaan & kelengkapan sapaan bahasa daerah';

    public function handle(
        GreetingResolver $resolver,
        GreetingRepository $repository,
        ProvinceMapper $mapper,
    ): int {
        // File bahasa daerah di-cache 1 jam; buang dulu supaya hasil pemeriksaan
        // mencerminkan isi file saat ini, bukan versi lama.
        $repository->flush();

        $referenceKeys = array_keys($repository->all(config('daerah.default', 'indonesia')));

        if ($referenceKeys === []) {
            $this->error('lang/daerah/'.config('daerah.default').'.php kosong — tidak ada acuan kunci.');

            return self::FAILURE;
        }

        if ($province = $this->option('province')) {
            return $this->inspectProvince($province, $resolver, $mapper, $referenceKeys);
        }

        if ($this->option('coverage')) {
            return $this->showCoverage($repository, $referenceKeys);
        }

        if ($this->option('identical')) {
            return $this->showIdentical($repository);
        }

        return $this->showOverview($resolver, $repository, $referenceKeys);
    }

    /** Rincian satu provinsi: rantai fallback + tiap frasa beserta asal bahasanya. */
    private function inspectProvince(
        string $province,
        GreetingResolver $resolver,
        ProvinceMapper $mapper,
        array $referenceKeys,
    ): int {
        // Menerima nama provinsi, kota (--province=Bandung), maupun bahasa
        // (--province=betawi) — sama seperti DAERAH_FORCE_PROVINCE dan ?daerah=.
        $resolved = $mapper->resolveName($province);

        if ($resolved !== null) {
            if (strcasecmp($resolved, $province) !== 0) {
                $this->line("\"{$province}\" dipetakan ke provinsi {$resolved}.");
            }

            $province = $resolved;
            $payload = $resolver->build($province);
        } else {
            $language = collect(app(GreetingRepository::class)->availableLanguages())
                ->first(fn ($item) => strcasecmp($item, $province) === 0);

            if ($language === null) {
                $this->error("\"{$province}\" bukan nama provinsi, kota, maupun bahasa yang dikenal.");
                $this->line('Contoh provinsi: '.implode(', ', array_slice(array_keys(config('daerah.province_island')), 0, 4)).', ...');
                $this->line('Contoh kota    : '.implode(', ', array_slice(array_keys(config('daerah.cities')), 0, 4)).', ...');
                $this->line('Contoh bahasa  : '.implode(', ', array_slice(app(GreetingRepository::class)->availableLanguages(), 0, 6)).', ...');

                return self::FAILURE;
            }

            $this->line("\"{$province}\" dibaca sebagai nama bahasa, bukan provinsi.");

            $province = null;
            $payload = $resolver->buildForLanguage($language);
        }

        $this->newLine();
        $this->info('Provinsi   : '.($province ?? '(tidak lewat provinsi)'));
        $this->info('Pulau      : '.($payload['island'] ?? '-'));
        $this->info('Bahasa     : '.$payload['language']);
        $this->info('Urutan     : '.implode('  →  ', $payload['chain']));
        $this->newLine();

        $rows = [];

        foreach ($referenceKeys as $key) {
            $from = $payload['resolved_from'][$key] ?? '-';

            $rows[] = [
                $key,
                $from === $payload['language'] ? "<info>{$from}</info>" : $from,
                $this->truncate($payload['phrases'][$key] ?? ''),
            ];
        }

        $this->table(['Kunci', 'Diambil dari', 'Teks tampil'], $rows);

        $native = collect($payload['resolved_from'])
            ->filter(fn ($lang) => $lang === $payload['language'])
            ->count();

        $this->line(sprintf(
            '%d dari %d frasa memakai bahasa provinsi sendiri; sisanya mundur ke fallback.',
            $native,
            count($referenceKeys),
        ));

        return self::SUCCESS;
    }

    /** Kelengkapan terjemahan tiap file bahasa. */
    private function showCoverage(GreetingRepository $repository, array $referenceKeys): int
    {
        $total = count($referenceKeys);
        $rows = [];

        foreach ($repository->availableLanguages() as $language) {
            $filled = count($repository->all($language));
            $percent = (int) round($filled / $total * 100);

            $label = match (true) {
                $percent === 100 => "<info>{$percent}%</info>",
                $percent > 0 => "<comment>{$percent}%</comment>",
                default => "{$percent}%",
            };

            $rows[] = [$language, "{$filled}/{$total}", $label];
        }

        // Yang paling lengkap di atas.
        usort($rows, fn ($a, $b) => strcmp($b[1], $a[1]));

        $this->table(['Bahasa', 'Terisi', 'Kelengkapan'], $rows);

        return self::SUCCESS;
    }

    /**
     * Frasa yang masih sama persis dengan Bahasa Indonesia.
     *
     * Ini penyebab keluhan "bahasanya tidak berubah": mekanismenya jalan, tapi
     * teksnya kebetulan sama sehingga halaman terlihat tidak berubah sama sekali.
     */
    private function showIdentical(GreetingRepository $repository): int
    {
        $indonesian = $repository->all(config('daerah.default', 'indonesia'));
        $rows = [];

        foreach ($repository->availableLanguages() as $language) {
            if ($language === config('daerah.default', 'indonesia')) {
                continue;
            }

            foreach ($repository->all($language) as $key => $value) {
                if (($indonesian[$key] ?? null) === $value) {
                    $rows[] = [$language, $key, $this->truncate($value)];
                }
            }
        }

        if ($rows === []) {
            $this->info('✓ Tidak ada frasa daerah yang masih sama persis dengan Bahasa Indonesia.');

            return self::SUCCESS;
        }

        $this->table(['Bahasa', 'Kunci', 'Teks (sama dgn Indonesia)'], $rows);
        $this->warn(count($rows).' frasa masih memakai teks Bahasa Indonesia — halaman akan terlihat tidak berubah.');

        return self::SUCCESS;
    }

    /** Ringkasan seluruh provinsi + pemeriksaan konsistensi konfigurasi. */
    private function showOverview(
        GreetingResolver $resolver,
        GreetingRepository $repository,
        array $referenceKeys,
    ): int {
        $problems = [];
        $rows = [];

        $configured = array_keys(config('daerah.province_island'));
        $available = $repository->availableLanguages();

        foreach ($configured as $province) {
            $payload = $resolver->build($province);

            $missing = array_diff($referenceKeys, array_keys($payload['phrases']));

            if ($missing !== []) {
                $problems[] = "{$province}: frasa hilang — ".implode(', ', $missing);
            }

            $native = collect($payload['resolved_from'])
                ->filter(fn ($lang) => $lang === $payload['language'])
                ->count();

            $status = match (true) {
                $native === count($referenceKeys) => '<info>penuh</info>',
                $native > 0 => '<comment>sebagian</comment>',
                default => 'fallback',
            };

            $rows[] = [
                $province,
                $payload['language'],
                implode(' → ', array_slice($payload['chain'], 1)) ?: '-',
                $status,
                $this->truncate($payload['phrases']['home_hero'] ?? '', 34),
            ];
        }

        $this->table(
            ['Provinsi', 'Bahasa', 'Fallback', 'Cakupan', 'Contoh (home_hero)'],
            $rows,
        );

        // ── Pemeriksaan konsistensi ─────────────────────────────────────────
        foreach (config('daerah.provinces') as $province => $language) {
            if (is_string($language) && ! in_array($language, $available, true)) {
                $problems[] = "config menunjuk bahasa \"{$language}\" ({$province}) tapi lang/daerah/{$language}.php tidak ada.";
            }
        }

        // Bahasa pulau adalah batas TERAKHIR rantai — Bahasa Indonesia sudah
        // tidak ikut. Kalau bahasa pulau tidak lengkap, ada kunci yang tidak
        // menghasilkan teks sama sekali dan sapaannya hilang dari halaman.
        foreach (config('daerah.islands') as $island => $language) {
            if (! in_array($language, $available, true)) {
                $problems[] = "fallback pulau \"{$island}\" menunjuk \"{$language}\" yang filenya tidak ada.";

                continue;
            }

            $missing = array_diff($referenceKeys, array_keys($repository->all($language)));

            if ($missing !== []) {
                $problems[] = "bahasa pulau \"{$language}\" ({$island}) belum lengkap — kunci hilang: "
                    .implode(', ', $missing).'. Tanpa ini sapaan akan kosong.';
            }
        }

        foreach ($configured as $province) {
            if (! array_key_exists($province, config('daerah.province_coordinates', []))) {
                $problems[] = "{$province} belum punya koordinat cadangan.";
            }

            if (! array_key_exists($province, config('daerah.province_bounds', []))) {
                $problems[] = "{$province} belum punya kotak batas — deteksi Geolocation akan memakai centroid yang jauh kurang akurat.";
            }
        }

        // Setiap kota harus menunjuk provinsi yang benar-benar ada.
        foreach (config('daerah.cities', []) as $city => $province) {
            if (! in_array($province, $configured, true)) {
                $problems[] = "kota \"{$city}\" menunjuk provinsi \"{$province}\" yang tidak dikenal.";
            }
        }

        // Titik tengah provinsi harus berada di dalam kotak batasnya sendiri.
        // Kalau tidak, salah satu dari keduanya salah tulis — dan gejalanya
        // (kota tetangga terbaca provinsi lain) sulit dilacak tanpa ini.
        foreach (config('daerah.province_bounds', []) as $province => $bounds) {
            $centroid = config('daerah.province_coordinates')[$province] ?? null;

            if ($centroid === null) {
                continue;
            }

            [$latMin, $lngMin, $latMax, $lngMax] = $bounds;
            [$lat, $lng] = $centroid;

            if ($lat < $latMin || $lat > $latMax || $lng < $lngMin || $lng > $lngMax) {
                $problems[] = "titik tengah {$province} ({$lat}, {$lng}) berada di luar kotak batasnya sendiri.";
            }
        }

        // Provinsi di database tapi belum dipetakan — sumber bug paling sering
        // saat ProvinceSeeder diperbarui.
        try {
            $unmapped = Province::pluck('name')
                ->reject(fn ($name) => in_array($name, $configured, true));

            foreach ($unmapped as $name) {
                $problems[] = "provinsi \"{$name}\" ada di database tapi belum ada di config/daerah.php.";
            }
        } catch (\Throwable $e) {
            $this->warn('Lewati pemeriksaan database: '.$e->getMessage());
        }

        $this->newLine();

        if ($problems === []) {
            $this->info(sprintf(
                '✓ %d provinsi terpetakan, semuanya mendapat %d frasa lengkap.',
                count($configured),
                count($referenceKeys),
            ));

            $this->line('Coba di browser: tambahkan ?daerah=Bali pada URL halaman mana pun.');

            return self::SUCCESS;
        }

        $this->error(count($problems).' masalah ditemukan:');

        foreach ($problems as $problem) {
            $this->line('  • '.$problem);
        }

        return self::FAILURE;
    }

    private function truncate(string $value, int $length = 44): string
    {
        return mb_strlen($value) > $length
            ? mb_substr($value, 0, $length - 1).'…'
            : $value;
    }
}
