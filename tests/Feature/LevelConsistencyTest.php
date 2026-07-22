<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\Level;
use App\Models\Place;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Konsistensi LEVEL di seluruh aplikasi.
 *
 * Satu user harus disebut dengan gelar yang sama di leaderboard, halaman
 * profil, dan halaman "Perjalanan Level Kamu" — termasuk tata letak jalannya.
 */
class LevelConsistencyTest extends TestCase
{
    use RefreshDatabase;

    // ── dari LevelSyncTest ───────────────────────────────────────
    public function test_level_id_selalu_sesuai_dengan_total_points(): void
    {
        foreach (UserDetail::with('level')->get() as $detail) {
            $this->assertSame(
                Level::idForPoints((int) $detail->total_points),
                $detail->level_id,
                "level_id {$detail->fullname} tidak cocok dengan {$detail->total_points} poin."
            );
        }
    }

    public function test_tidak_ada_user_tanpa_level(): void
    {
        $this->assertSame(0, UserDetail::whereNull('level_id')->count());
    }

    public function test_total_points_selalu_sama_dengan_jumlah_poin_lencana(): void
    {
        // Lencana adalah SATU-SATUNYA sumber poin. Kalau seeder menulis poin
        // sendiri, angka di leaderboard tidak akan cocok dengan lencana yang
        // benar-benar dipajang di halaman profil user.
        foreach (UserDetail::with('user')->get() as $detail) {
            $poinLencana = (int) DB::table('user_badges')
                ->join('badges', 'badges.id', '=', 'user_badges.badge_id')
                ->where('user_badges.user_id', $detail->user_id)
                ->sum('badges.points');

            $this->assertSame(
                $poinLencana,
                (int) $detail->total_points,
                "{$detail->fullname}: total_points ({$detail->total_points}) "
                ."tidak sama dengan jumlah poin lencananya ({$poinLencana})."
            );
        }
    }

    public function test_seluruh_tingkat_lencana_bisa_diraih_dengan_katalog_saat_ini(): void
    {
        // Tingkat yang targetnya melebihi jumlah tempat yang ada tidak akan pernah
        // bisa diraih siapa pun — dan itu membuat level atas mustahil dicapai.
        $maksPerKategori = [
            'Si Paling Pantai' => Place::whereHas('categories', fn ($q) => $q->where('name', 'Wisata Alam'))->count(),
            'Si Paling Puncak' => Place::whereHas('categories', fn ($q) => $q->where('name', 'Wisata Alam'))->count(),
            'Si Paling Kuliner' => Place::whereHas('categories', fn ($q) => $q->where('name', 'Kuliner'))->count(),
            'Si Paling Hidden Gem' => Place::whereHas('categories', fn ($q) => $q->where('name', 'Hidden Gem'))->count(),
            'Si Paling Budaya' => Place::whereHas('categories', fn ($q) => $q->where('name', 'Wisata Budaya'))->count(),
            'Si Paling Penjelajah' => Place::count(),
        ];

        foreach ($maksPerKategori as $category => $maks) {
            $tertinggi = (int) Badge::where('category', $category)->max('tier_target');

            $this->assertLessThanOrEqual(
                $maks,
                $tertinggi,
                "{$category}: target tertinggi {$tertinggi} melebihi jumlah tempat yang tersedia ({$maks})."
            );
        }
    }

    public function test_leaderboard_memakai_lebih_dari_satu_level(): void
    {
        // Inti keluhannya: kalau semua user bergelar sama, fitur level tidak
        // terlihat bekerja di leaderboard.
        //
        // User-nya dibuat di sini, bukan diambil dari data seed. DatabaseSeeder
        // sekarang hanya memakai ProductionUserSeeder (dua akun), jadi versi
        // lama menguji komposisi seeder — bukan apakah leaderboard benar-benar
        // menampilkan level yang berbeda-beda.
        $tingkat = Level::orderBy('order')->take(3)->get();

        $this->assertCount(3, $tingkat, 'Katalog level kurang dari 3 tingkat.');

        foreach ($tingkat as $index => $level) {
            $user = User::factory()->create();

            UserDetail::factory()->create([
                'user_id' => $user->id,
                'fullname' => "Penguji Level {$index}",
                'total_points' => $level->min_points,
                'level_id' => $level->id,
            ]);
        }

        $levels = UserDetail::byRank()
            ->take(10)
            ->with('level')
            ->get()
            ->pluck('level.name')
            ->unique();

        $this->assertGreaterThan(
            2,
            $levels->count(),
            'User teratas nyaris bergelar sama — sistem level tidak terlihat.'
        );
    }

    public function test_nama_level_di_leaderboard_sama_dengan_detail_user(): void
    {
        $response = $this->actingAs(User::first())
            ->get(route('challenge.leaderboard'));

        $response->assertOk();

        $leaderboard = collect($response->viewData('page')['props']['leaderboard']);

        $this->assertNotEmpty($leaderboard);

        foreach ($leaderboard as $row) {
            $detail = UserDetail::with('level')
                ->where('user_id', $row['user_id'])
                ->first();

            $this->assertSame(
                $detail->level?->name,
                $row['level'],
                "Level {$row['name']} di leaderboard berbeda dari detail user."
            );
        }
    }

    // ── dari ProfileLevelTest ────────────────────────────────────
    public function test_profil_user_lain_mengirim_level_ke_halaman(): void
    {
        $penonton = User::whereHas('userDetail')->first();

        // User lain dengan poin tertinggi — pasti punya level selain yang terbawah.
        $target = UserDetail::with('user')
            ->where('user_id', '!=', $penonton->id)
            ->orderByDesc('total_points')
            ->first();

        $response = $this->actingAs($penonton)
            ->get(route('profile.show', ['username' => $target->user->username]));

        $response->assertOk();

        $props = $response->viewData('page')['props'];

        $this->assertNotNull(
            $props['targetUser']['user_detail']['level'] ?? null,
            'Profil user lain tidak menyertakan data level.'
        );

        $this->assertSame(
            $target->level->name,
            $props['targetUser']['user_detail']['level']['name'],
            'Level di halaman profil berbeda dari level tersimpan user.'
        );
    }

    public function test_profil_sendiri_mengirim_level_ke_halaman(): void
    {
        $user = User::whereHas('userDetail')->first();

        $response = $this->actingAs($user)->get(route('profile.index'));

        $response->assertOk();

        $props = $response->viewData('page')['props'];

        $this->assertSame(
            $user->userDetail->level->name,
            $props['user']['user_detail']['level']['name'] ?? null,
        );
    }

    public function test_level_di_profil_sama_dengan_di_leaderboard(): void
    {
        $penonton = User::whereHas('userDetail')->first();

        $leaderboard = collect(
            $this->actingAs($penonton)
                ->get(route('challenge.leaderboard'))
                ->viewData('page')['props']['leaderboard']
        );

        $baris = $leaderboard->firstWhere('user_id', '!=', $penonton->id);

        $this->assertNotNull($baris, 'Leaderboard kosong.');

        $props = $this->actingAs($penonton)
            ->get(route('profile.show', ['username' => $baris['username']]))
            ->viewData('page')['props'];

        $this->assertSame(
            $baris['level'],
            $props['targetUser']['user_detail']['level']['name'],
            'Gelar di leaderboard berbeda dari gelar di halaman profil.'
        );
    }

    // ── dari LevelPageSyncTest ───────────────────────────────────
    private function userBerpoin(): User
    {
        return UserDetail::orderByDesc('total_points')->first()->user;
    }

    public function test_level_di_halaman_sama_dengan_level_tersimpan(): void
    {
        $user = $this->userBerpoin();

        $props = $this->actingAs($user)
            ->get(route('challenge.levels'))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertSame(
            $user->userDetail->level->name,
            $props['currentLevel']['name'],
            'Level di halaman Level berbeda dari level tersimpan user.'
        );

        $this->assertSame(
            (int) $user->userDetail->total_points,
            (int) $props['totalPoints'],
        );
    }

    public function test_level_di_halaman_level_sama_dengan_di_leaderboard(): void
    {
        $user = $this->userBerpoin();

        $levelPage = $this->actingAs($user)
            ->get(route('challenge.levels'))
            ->viewData('page')['props']['currentLevel']['name'];

        $leaderboard = collect(
            $this->actingAs($user)
                ->get(route('challenge.leaderboard'))
                ->viewData('page')['props']['leaderboard']
        )->firstWhere('user_id', $user->id);

        $this->assertNotNull($leaderboard, 'User tidak muncul di leaderboard.');

        $this->assertSame(
            $leaderboard['level'],
            $levelPage,
            'Gelar di halaman Level berbeda dari gelar di leaderboard.'
        );
    }

    public function test_level_saat_ini_ada_di_daftar_semua_level(): void
    {
        // Penanda posisi mobil dicocokkan lewat NAMA level; kalau currentLevel
        // tidak ada di allLevels, indeksnya -1 dan mobil terlempar ke awal jalan.
        $props = $this->actingAs($this->userBerpoin())
            ->get(route('challenge.levels'))
            ->viewData('page')['props'];

        $nama = array_column($props['allLevels'], 'name');

        $this->assertContains($props['currentLevel']['name'], $nama);
    }

    public function test_penanda_level_dihitung_dari_jalur_svg(): void
    {
        // Dulu koordinat penanda ditulis tangan dan tidak menempel di jalur yang
        // dilalui mobil, sehingga mobil tidak pernah berhenti di penandanya.
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        $this->assertStringContainsString(
            'path.getPointAtLength(',
            $source,
            'Penanda level tidak lagi dihitung dari jalur SVG.'
        );

        $this->assertStringNotContainsString(
            '{ top: 40, left: 50 }',
            $source,
            'Koordinat penanda yang ditulis tangan masih ada.'
        );
    }

    public function test_garis_berwarna_memakai_panjang_jalur_yang_terukur(): void
    {
        // Dulu garis berwarna memakai panjang tetap 2600 sementara mobil memakai
        // getTotalLength() yang sebenarnya, sehingga ujung garis tidak pernah
        // berhimpit dengan mobil.
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        $this->assertDoesNotMatchRegularExpression(
            '/const pathLength = \d+;/',
            $source,
            'Panjang jalur masih ditulis tetap, bukan diukur.'
        );

        $this->assertStringContainsString(
            'setPathLength(totalLength)',
            $source,
            'Panjang jalur tidak diambil dari getTotalLength().'
        );

        $this->assertStringContainsString(
            'stroke-dasharray: ${strokeLength}',
            $source,
            'Garis berwarna tidak memakai panjang jalur yang terukur.'
        );
    }

    public function test_penanda_dan_mobil_sama_sama_memakai_posisi_persen(): void
    {
        // Mobil memakai persen (x/800, y/900) sementara penanda sempat memakai
        // piksel mentah — akibatnya keduanya berpisah begitu lebar kontainer
        // bukan tepat 800px, yaitu di hampir semua layar.
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        $this->assertStringNotContainsString(
            "pos.top + 'px'",
            $source,
            'Penanda level masih diposisikan dengan piksel mentah.',
        );

        // Pembaginya mengikuti viewBox jalan yang sedang dipakai — bukan angka
        // tetap — karena bentuk jalan berbeda antara ponsel dan layar lebar.
        $this->assertStringContainsString('(pos.left / road.width) * 100', $source);
        $this->assertStringContainsString('(pos.top / road.height) * 100', $source);
        $this->assertStringContainsString('(x / road.width) * 100', $source);
        $this->assertStringContainsString('(y / road.height) * 100', $source);

        // Kontainer harus mengunci rasio yang sama dengan viewBox, kalau tidak
        // SVG-nya di-letterbox dan posisi persen ikut meleset.
        $this->assertStringContainsString(
            'aspectRatio: `${road.width} / ${road.height}`',
            $source,
        );

        $this->assertStringNotContainsString(
            'max-w-[800px] h-[900px]',
            $source,
            'Tinggi kontainer masih dipatok piksel, bukan mengikuti rasio.',
        );
    }

    public function test_ada_bentuk_jalan_khusus_layar_sempit(): void
    {
        // Bentuk lebar 800x900 kalau dipaksakan ke ponsel hanya setinggi ±386px.
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        $this->assertStringContainsString('const ROAD_WIDE', $source);
        $this->assertStringContainsString('const ROAD_TALL', $source);

        $this->assertStringContainsString(
            "matchMedia('(max-width: 639px)')",
            $source,
            'Tidak ada pergantian bentuk jalan berdasarkan lebar layar.',
        );

        // Versi ponsel harus lebih tinggi daripada lebarnya.
        preg_match('/const ROAD_TALL = \{\s*width: (\d+),\s*height: (\d+)/', $source, $m);

        $this->assertNotEmpty($m, 'ROAD_TALL tidak terbaca.');
        $this->assertGreaterThan(
            (int) $m[1] * 2,
            (int) $m[2],
            'Jalur versi ponsel belum cukup memanjang ke bawah.',
        );
    }

    public function test_warna_jalan_memakai_palet_tema(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        // primary-100 untuk bagian yang sudah ditempuh, primary-30 untuk sisanya.
        $this->assertStringContainsString('stroke: #5A3812', $source);
        $this->assertStringContainsString('stroke: #D5B9AA', $source);

        // Warna abu-abu di luar tema tidak boleh kembali.
        foreach (['#474D53', '#9AA1A7', '#724633'] as $lama) {
            $this->assertStringNotContainsString(
                $lama,
                $source,
                "Warna jalan {$lama} di luar palet tema masih terpakai.",
            );
        }
    }

    public function test_garis_dan_mobil_memakai_durasi_dan_kurva_yang_sama(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Challenge/Levels.jsx'));

        // Mobil: duration 2500 ms, ease-out cubic.
        $this->assertStringContainsString('const duration = 2500;', $source);
        $this->assertStringContainsString('1 - Math.pow(1 - progress, 3)', $source);

        // Garis: 2.5s dengan kurva ease-out cubic yang setara.
        $this->assertStringContainsString(
            'stroke-dashoffset 2.5s cubic-bezier(0.33, 1, 0.68, 1)',
            $source,
            'Kurva animasi garis tidak sama dengan animasi mobil.'
        );
    }
}
