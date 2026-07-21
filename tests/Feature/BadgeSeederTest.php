<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\Level;
use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Menjaga agar data lencana tetap utuh:
 *  - setiap gambar di public/images/badges dipakai;
 *  - setiap kategori lencana benar-benar bisa diraih;
 *  - total poin yang mungkin diraih cukup untuk mencapai level tertinggi.
 */
class BadgeSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_setiap_gambar_lencana_dipakai_seeder(): void
    {
        $used = Badge::pluck('icon_path')
            ->map(fn ($path) => str_replace('\\', '/', $path))
            ->all();

        $files = [];

        foreach (glob(public_path('images/badges').'/*/*.png') as $file) {
            $files[] = 'images/badges/'.basename(dirname($file)).'/'.basename($file);
        }

        $this->assertNotEmpty($files);

        $unused = array_diff($files, $used);

        $this->assertSame(
            [],
            array_values($unused),
            'Ada gambar lencana yang belum dipakai seeder: '.implode(', ', $unused)
        );
    }

    public function test_setiap_gambar_yang_dirujuk_benar_benar_ada(): void
    {
        foreach (Badge::pluck('icon_path') as $path) {
            $this->assertFileExists(
                public_path($path),
                "Lencana merujuk gambar yang tidak ada: {$path}"
            );
        }
    }

    public function test_setiap_kategori_bertingkat_punya_empat_tingkat(): void
    {
        $categories = Badge::where('type', 'general')
            ->select('category')
            ->distinct()
            ->pluck('category');

        $this->assertGreaterThanOrEqual(8, $categories->count());

        foreach ($categories as $category) {
            $tiers = Badge::where('category', $category)->pluck('tier_level')->sort()->values()->all();

            $this->assertSame([1, 2, 3, 4], $tiers, "Kategori {$category} tingkatannya tidak lengkap.");
        }
    }

    public function test_setiap_kategori_lencana_bisa_dihitung(): void
    {
        // Kategori yang tidak punya hitungan tidak akan pernah bisa diraih.
        $user = User::factory()->create();

        $counted = array_keys(app(GamificationService::class)->albumCategoryCounts($user));

        $categories = Badge::where('type', 'general')
            ->select('category')
            ->distinct()
            ->pluck('category');

        foreach ($categories as $category) {
            $this->assertContains(
                $category,
                $counted,
                "Kategori {$category} tidak dihitung GamificationService — lencananya mustahil diraih."
            );
        }
    }

    public function test_poin_naik_di_tiap_tingkat(): void
    {
        foreach (Badge::where('type', 'general')->get()->groupBy('category') as $category => $badges) {
            $byTier = $badges->sortBy('tier_level')->pluck('points')->all();

            for ($i = 1; $i < count($byTier); $i++) {
                $this->assertGreaterThan(
                    $byTier[$i - 1],
                    $byTier[$i],
                    "Poin {$category} tidak naik di tingkat ".($i + 1).'.'
                );
            }
        }
    }

    public function test_total_poin_cukup_untuk_level_tertinggi(): void
    {
        // Inti masalah sebelumnya: seluruh lencana hanya bernilai ±5.300 poin,
        // sedangkan level tertinggi butuh 15.000 — mustahil dicapai.
        $total = (int) Badge::sum('points');
        $tertinggi = (int) Level::orderByDesc('order')->value('min_points');

        $this->assertGreaterThan(
            $tertinggi,
            $total,
            "Total poin lencana ({$total}) tidak cukup mencapai level tertinggi ({$tertinggi})."
        );
    }

    public function test_level_tertinggi_menuntut_hampir_seluruh_lencana(): void
    {
        // Kalau ambang level puncak terlalu rendah, gelar tertinggi jadi murah
        // dan sisa poin yang bisa dikumpulkan tidak lagi menaikkan level apa pun.
        $total = (int) Badge::sum('points');
        $tertinggi = (int) Level::orderByDesc('order')->value('min_points');

        $porsi = $tertinggi / $total;

        $this->assertGreaterThan(
            0.7,
            $porsi,
            sprintf(
                'Level tertinggi hanya butuh %.0f%% dari total poin lencana — terlalu murah.',
                $porsi * 100,
            ),
        );

        // Sebaliknya jangan sampai mustahil: harus tetap di bawah total.
        $this->assertLessThan(0.95, $porsi, 'Level tertinggi nyaris mustahil dicapai.');
    }

    public function test_jarak_antar_level_semakin_lebar(): void
    {
        // Kurva progres: tiap level berikutnya menuntut usaha lebih besar.
        $ambang = Level::orderBy('order')->pluck('min_points')->all();

        $jarakSebelumnya = 0;

        for ($i = 1; $i < count($ambang); $i++) {
            $jarak = $ambang[$i] - $ambang[$i - 1];

            $this->assertGreaterThanOrEqual(
                $jarakSebelumnya,
                $jarak,
                'Jarak menuju level ke-'.($i + 1).' lebih sempit daripada level sebelumnya.'
            );

            $jarakSebelumnya = $jarak;
        }
    }
}
