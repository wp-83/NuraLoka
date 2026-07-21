<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Judul halaman (<title>): terlokalisasi id/en/ko dan berformat
 * "NuraLoka | ..." di seluruh halaman.
 */
class PageTitleTest extends TestCase
{
    use RefreshDatabase;

    // ── dari PageTitleLocalizationTest ───────────────────────────

    private function titles(string $locale): array
    {
        return require lang_path($locale.'/title.php');
    }

    public function test_kunci_judul_sama_di_ketiga_bahasa(): void
    {
        $id = array_keys($this->titles('id'));

        foreach (['en', 'ko'] as $locale) {
            $this->assertSame(
                $id,
                array_keys($this->titles($locale)),
                "Kunci judul di {$locale} berbeda dari id."
            );
        }
    }

    public function test_tidak_ada_judul_yang_kosong(): void
    {
        foreach (['id', 'en', 'ko'] as $locale) {
            foreach ($this->titles($locale) as $key => $value) {
                $this->assertNotSame('', trim($value), "{$locale}.{$key} kosong.");
            }
        }
    }

    public function test_terjemahan_en_dan_ko_benar_benar_berbeda_dari_id(): void
    {
        $id = $this->titles('id');

        // Sebagian judul memang sama karena serapan (mis. "Album"), tapi kalau
        // SEMUANYA sama berarti file itu belum diterjemahkan sama sekali.
        foreach (['en', 'ko'] as $locale) {
            $translated = $this->titles($locale);

            $different = 0;
            foreach ($id as $key => $value) {
                if (($translated[$key] ?? null) !== $value) {
                    $different++;
                }
            }

            $this->assertGreaterThan(
                count($id) * 0.8,
                $different,
                "File judul {$locale} terlalu banyak yang sama dengan id."
            );
        }
    }

    public function test_semua_kunci_yang_dipakai_halaman_tersedia(): void
    {
        $available = array_keys($this->titles('id'));

        $used = [];

        foreach (glob(resource_path('js/Pages').'/{,*/,*/*/}*.jsx', GLOB_BRACE) as $file) {
            preg_match_all('/pageTitle="title\.([a-z_]+)"/', file_get_contents($file), $matches);

            foreach ($matches[1] as $key) {
                $used[$key] = basename($file);
            }
        }

        $this->assertNotEmpty($used, 'Tidak ada halaman yang memakai kunci judul.');

        foreach ($used as $key => $file) {
            $this->assertContains(
                $key,
                $available,
                "{$file} memakai title.{$key} yang tidak ada di lang/*/title.php."
            );
        }
    }

    public function test_tidak_ada_lagi_judul_yang_ditulis_langsung(): void
    {
        $offenders = [];

        foreach (glob(resource_path('js/Pages').'/{,*/,*/*/}*.jsx', GLOB_BRACE) as $file) {
            preg_match_all('/pageTitle="([^"]*)"/', file_get_contents($file), $matches);

            foreach ($matches[1] as $value) {
                if (! str_starts_with($value, 'title.')) {
                    $offenders[] = basename($file).': '.$value;
                }
            }
        }

        $this->assertSame([], $offenders, 'Masih ada judul halaman yang ditulis langsung.');
    }

    // ── dari ChallengeTitleTest ──────────────────────────────────

    private function halamanTantangan(): array
    {
        return glob(resource_path('js/Pages/Challenge').'/*.jsx');
    }

    public function test_layout_menyusun_judul_dengan_nuraloka_di_depan(): void
    {
        $layout = file_get_contents(resource_path('js/Layouts/MainLayout.jsx'));

        $this->assertStringContainsString(
            '`NuraLoka${resolvedTitle ? ` | ${resolvedTitle}` : \'\'}`',
            $layout,
            'MainLayout tidak lagi menyusun judul sebagai "NuraLoka | ...".'
        );
    }

    public function test_setiap_halaman_tantangan_mengirim_kunci_judul(): void
    {
        $expected = [
            'Index.jsx' => 'title.challenge',
            'Badges.jsx' => 'title.badges',
            'Levels.jsx' => 'title.levels',
            'LeaderboardFull.jsx' => 'title.leaderboard',
        ];

        foreach ($expected as $file => $key) {
            $source = file_get_contents(resource_path('js/Pages/Challenge/'.$file));

            $this->assertStringContainsString(
                'pageTitle="'.$key.'"',
                $source,
                "{$file} tidak mengirim pageTitle=\"{$key}\"."
            );
        }
    }

    public function test_kunci_judul_tantangan_ada_di_ketiga_bahasa(): void
    {
        foreach (['id', 'en', 'ko'] as $locale) {
            $titles = require lang_path($locale.'/title.php');

            foreach (['challenge', 'badges', 'levels', 'leaderboard'] as $key) {
                $this->assertArrayHasKey($key, $titles, "title.{$key} hilang di {$locale}.");
                $this->assertNotSame('', trim($titles[$key]));
            }
        }
    }

    public function test_tidak_ada_lagi_judul_dengan_urutan_terbalik(): void
    {
        $offenders = [];

        foreach ($this->halamanTantangan() as $file) {
            if (str_contains(file_get_contents($file), '| NuraLoka`')) {
                $offenders[] = basename($file);
            }
        }

        $this->assertSame([], $offenders, 'Masih ada judul berformat "... | NuraLoka".');
    }

    public function test_halaman_tantangan_hanya_punya_satu_sumber_judul(): void
    {
        // Dua sumber judul (<Head title> di halaman + pageTitle di layout) membuat
        // salah satunya diam-diam tidak terpakai.
        foreach ($this->halamanTantangan() as $file) {
            $this->assertStringNotContainsString(
                '<Head title',
                file_get_contents($file),
                basename($file).' masih memasang <Head title> sendiri.'
            );
        }
    }
}
