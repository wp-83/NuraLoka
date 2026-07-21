<?php

namespace Tests\Feature;

use App\Models\Level;
use App\Models\Mission;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\UserMission;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Konsistensi PROGRES misi & lencana.
 *
 * Angka yang sama harus muncul di beranda, halaman Tantangan, dan halaman
 * Lencana — dan poin selalu sama dengan jumlah poin lencana yang dimiliki.
 */
class MissionBadgeProgressTest extends TestCase
{
    use RefreshDatabase;

    // ── dari OngoingMissionTest ──────────────────────────────────
    private function user(): User
    {
        return User::whereHas('userDetail')->first();
    }

    public function test_misi_terpilih_adalah_yang_sisa_langkahnya_paling_sedikit(): void
    {
        $user = $this->user();

        $mission = app(GamificationService::class)->ongoingMissions($user)->first();

        $this->assertNotNull($mission, 'Tidak ada misi berjalan.');

        // Tidak boleh ada misi lain yang sisanya lebih sedikit DAN sudah dimulai.
        $semua = app(GamificationService::class)->ongoingMissions($user, 100);

        foreach ($semua as $lain) {
            if ($lain->progress > 0 && $mission->progress > 0) {
                $this->assertLessThanOrEqual(
                    $lain->remaining,
                    $mission->remaining,
                    "Misi \"{$lain->title}\" (sisa {$lain->remaining}) lebih dekat selesai daripada yang dipilih."
                );
            }
        }
    }

    public function test_misi_lencana_khusus_tetap_memakai_penghitung_aksi(): void
    {
        // Lencana khusus tidak punya padanan data album, jadi progresnya memang
        // harus datang dari user_missions.progress.
        $user = $this->user();

        $mission = Mission::join('badges', 'missions.badge_id', '=', 'badges.id')
            ->whereNull('badges.category')
            ->where('missions.target', '>', 1)
            ->select('missions.*')
            ->first();

        if (! $mission) {
            $this->markTestSkipped('Tidak ada misi lencana khusus bertarget > 1.');
        }

        UserMission::updateOrCreate(
            ['user_id' => $user->id, 'mission_id' => $mission->id],
            ['progress' => $mission->target - 1, 'status' => 'on_going'],
        );

        $terpilih = app(GamificationService::class)
            ->ongoingMissions($user, 100)
            ->firstWhere('id', $mission->id);

        $this->assertNotNull($terpilih, 'Misi lencana khusus tidak muncul sebagai berjalan.');
        $this->assertSame($mission->target - 1, (int) $terpilih->progress);
        $this->assertSame(1, $terpilih->remaining);
    }

    public function test_misi_bertingkat_tidak_memakai_penghitung_aksi(): void
    {
        // Menaikkan penghitung aksi TIDAK boleh menggeser progres misi
        // bertingkat — angkanya harus tetap mengikuti data album, supaya sama
        // dengan halaman Lencana.
        $user = $this->user();

        $mission = Mission::join('badges', 'missions.badge_id', '=', 'badges.id')
            ->whereNotNull('badges.category')
            ->where('missions.target', '>', 5)
            ->select('missions.*')
            ->first();

        $sebelum = app(GamificationService::class)
            ->ongoingMissions($user, 100)
            ->firstWhere('id', $mission->id);

        UserMission::updateOrCreate(
            ['user_id' => $user->id, 'mission_id' => $mission->id],
            ['progress' => $mission->target - 1, 'status' => 'on_going'],
        );

        $sesudah = app(GamificationService::class)
            ->ongoingMissions($user, 100)
            ->firstWhere('id', $mission->id);

        $this->assertNotNull($sesudah);
        $this->assertSame(
            (int) $sebelum->progress,
            (int) $sesudah->progress,
            'Progres misi bertingkat ikut berubah saat penghitung aksi dinaikkan.',
        );
    }

    public function test_misi_yang_progresnya_sudah_mencapai_target_tidak_dianggap_berjalan(): void
    {
        // Terjadi bila target sebuah misi diturunkan setelah progres tercatat.
        // Tanpa penyaringan, misinya tampil dengan bilah 100% tapi tetap
        // disebut "sedang berjalan".
        $user = $this->user();
        $mission = Mission::first();

        UserMission::updateOrCreate(
            ['user_id' => $user->id, 'mission_id' => $mission->id],
            ['progress' => $mission->target + 5, 'status' => 'on_going'],
        );

        $ids = app(GamificationService::class)
            ->ongoingMissions($user, 100)
            ->pluck('id')
            ->all();

        $this->assertNotContains(
            $mission->id,
            $ids,
            'Misi dengan progres melebihi target masih dianggap berjalan.'
        );
    }

    public function test_beranda_dan_tantangan_menampilkan_misi_yang_sama(): void
    {
        $user = $this->user();

        $beranda = $this->actingAs($user)
            ->get(route('home.index'))
            ->assertOk()
            ->viewData('page')['props']['ongoingMission'];

        $tantangan = collect(
            $this->actingAs($user)
                ->get(route('challenge.index'))
                ->assertOk()
                ->viewData('page')['props']['ongoingMissions']
        )->first();

        $this->assertNotNull($beranda, 'Beranda tidak menampilkan misi.');
        $this->assertNotNull($tantangan, 'Halaman Tantangan tidak menampilkan misi.');

        $this->assertSame($tantangan['id'], $beranda['id'], 'Misi di beranda berbeda dari di Tantangan.');
        $this->assertSame($tantangan['percent'], $beranda['percent'], 'Persentase progres berbeda.');
        $this->assertSame($tantangan['progress'], $beranda['progress']);
        $this->assertSame($tantangan['target'], $beranda['target']);
    }

    public function test_persentase_sesuai_progres_dan_target(): void
    {
        $mission = app(GamificationService::class)->ongoingMissions($this->user())->first();

        $this->assertSame(
            (int) min(100, round($mission->progress / $mission->target * 100)),
            (int) $mission->percent,
        );

        // Misi berjalan tidak boleh 100% — kalau 100% berarti sudah selesai.
        $this->assertLessThan(100, $mission->percent);
    }

    public function test_progres_misi_sama_dengan_progres_di_halaman_lencana(): void
    {
        // Tiap misi mencerminkan satu lencana. Dulu misi menghitung JUMLAH AKSI
        // sedangkan lencana menghitung DATA NYATA, sehingga "Si Paling Cerita"
        // yang sama bisa tertulis 80% di beranda tapi 0% di halaman Lencana.
        $user = $this->user();

        $missions = app(GamificationService::class)->ongoingMissions($user, 100);

        $lencana = collect(
            $this->actingAs($user)
                ->get(route('challenge.badges'))
                ->viewData('page')['props']['generalBadges']
        )->keyBy('name');

        $diperiksa = 0;

        foreach ($missions as $mission) {
            if ($mission->badge_category === null) {
                continue; // lencana khusus tidak punya padanan data
            }

            $kategori = $lencana->get($mission->badge_category);

            $this->assertNotNull($kategori, "Kategori {$mission->badge_category} tidak ada di halaman Lencana.");

            $this->assertSame(
                (int) $kategori['progressCount'],
                (int) $mission->progress,
                "Progres \"{$mission->title}\" di beranda ({$mission->progress}) berbeda dari "
                ."halaman Lencana ({$kategori['progressCount']}).",
            );

            $diperiksa++;
        }

        $this->assertGreaterThan(0, $diperiksa, 'Tidak ada misi bertingkat yang diperiksa.');
    }

    public function test_kueri_misi_tidak_disalin_di_controller(): void
    {
        foreach (['HomeController', 'ChallengeController'] as $controller) {
            $source = file_get_contents(app_path("Http/Controllers/{$controller}.php"));

            $this->assertStringNotContainsString(
                'user_missions.progress',
                $source,
                "{$controller} masih menyalin kueri misi — kedua halaman bisa berbeda lagi."
            );
        }
    }

    // ── dari BadgeProgressTest ───────────────────────────────────
    private function generalBadges(User $user): array
    {
        return $this->actingAs($user)
            ->get(route('challenge.badges'))
            ->assertOk()
            ->viewData('page')['props']['generalBadges'];
    }

    public function test_progres_tidak_pernah_lebih_rendah_dari_tingkat_yang_dimiliki(): void
    {
        foreach (User::whereHas('userDetail')->take(5)->get() as $user) {
            foreach ($this->generalBadges($user) as $kategori) {
                $tertinggiDimiliki = collect($kategori['tiers'])
                    ->filter(fn ($t) => $t['earned'])
                    ->max('target') ?? 0;

                $this->assertGreaterThanOrEqual(
                    $tertinggiDimiliki,
                    $kategori['progressCount'],
                    "{$user->username} — {$kategori['name']}: progres {$kategori['progressCount']} "
                    ."lebih rendah dari tingkat tertinggi yang dimiliki ({$tertinggiDimiliki})."
                );
            }
        }
    }

    public function test_target_berikutnya_selalu_di_atas_progres(): void
    {
        foreach ($this->generalBadges(User::whereHas('userDetail')->first()) as $kategori) {
            // Kecuali sudah maksimal, target berikutnya harus lebih besar dari
            // progres — kalau tidak, cincinnya penuh tapi tingkatnya belum naik.
            if ($kategori['nextTier'] !== 'Maksimal') {
                $this->assertGreaterThan(
                    $kategori['progressCount'],
                    $kategori['progressTarget'],
                    "{$kategori['name']}: target berikutnya tidak di atas progres.",
                );
            }
        }
    }

    public function test_persentase_sesuai_hitungan_yang_ditampilkan(): void
    {
        foreach ($this->generalBadges(User::whereHas('userDetail')->first()) as $kategori) {
            $diharapkan = $kategori['progressTarget'] > 0
                ? min(100, (int) round($kategori['progressCount'] / $kategori['progressTarget'] * 100))
                : 100;

            $this->assertSame(
                $diharapkan,
                $kategori['progress'],
                "{$kategori['name']}: persentase cincin tidak cocok dengan angka "
                ."{$kategori['progressCount']}/{$kategori['progressTarget']}.",
            );
        }
    }

    public function test_tingkat_yang_targetnya_sudah_terlampaui_ikut_ditandai(): void
    {
        // Kebalikannya: kalau progres sudah melewati target sebuah tingkat,
        // tingkat itu tidak boleh tampil sebagai belum didapat.
        $user = User::whereHas('userDetail')->first();

        foreach ($this->generalBadges($user) as $kategori) {
            foreach ($kategori['tiers'] as $tier) {
                if ($kategori['progressCount'] >= $tier['target']) {
                    $this->assertTrue(
                        $tier['earned'],
                        "{$kategori['name']} — tingkat {$tier['name']} (target {$tier['target']}) "
                        ."belum ditandai padahal progresnya sudah {$kategori['progressCount']}.",
                    );
                }
            }
        }
    }

    // ── dari MissionPointSyncTest ────────────────────────────────
    private function poinLencana(User $user): int
    {
        return (int) DB::table('user_badges')
            ->join('badges', 'badges.id', '=', 'user_badges.badge_id')
            ->where('user_badges.user_id', $user->id)
            ->sum('badges.points');
    }

    public function test_menyelesaikan_misi_menjaga_poin_tetap_sama_dengan_lencana(): void
    {
        $user = User::factory()->create();
        UserDetail::create([
            'user_id' => $user->id,
            'province_id' => 1,
            'fullname' => 'Penguji Misi',
            'dob' => '2000-01-01',
            'gender' => 'unspecified',
            'total_points' => 0,
            'level_id' => Level::idForPoints(0),
        ]);

        $gamification = app(GamificationService::class);

        // Lewat API publik record(), persis seperti yang dipanggil controller.
        // 'create_album' dipilih karena misinya tidak tersaring kategori tempat.
        $langkah = (int) Mission::where('action_type', 'create_album')
            ->whereNull('category_id')
            ->max('target');

        $this->assertGreaterThan(0, $langkah, 'Tidak ada misi create_album untuk diuji.');

        for ($i = 0; $i < $langkah; $i++) {
            $gamification->record($user, 'create_album');

            $user->refresh();

            $this->assertSame(
                $this->poinLencana($user),
                (int) $user->userDetail->total_points,
                "Setelah aksi ke-{$i}, poin tidak sama dengan jumlah poin lencana."
            );
        }

        // Pastikan memang ada lencana yang diraih, bukan lolos karena 0 = 0.
        $this->assertGreaterThan(0, $this->poinLencana($user->refresh()));
    }

    public function test_points_reward_misi_sama_dengan_poin_lencananya(): void
    {

        $beda = DB::table('missions')
            ->join('badges', 'badges.id', '=', 'missions.badge_id')
            ->whereColumn('missions.points_reward', '!=', 'badges.points')
            ->pluck('missions.title')
            ->all();

        $this->assertSame(
            [],
            $beda,
            'points_reward misi berbeda dari poin lencananya: '.implode(', ', $beda)
        );
    }

    public function test_seluruh_user_hasil_seeding_poinnya_sama_dengan_lencana(): void
    {

        foreach (User::with('userDetail')->get() as $user) {
            $this->assertSame(
                $this->poinLencana($user),
                (int) $user->userDetail->total_points,
                "{$user->username}: poin tidak sama dengan jumlah poin lencananya."
            );
        }
    }
}
