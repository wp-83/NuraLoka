<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Level;
use App\Models\User;
use App\Services\GamificationService;
use Database\Seeders\Concerns\SeedsAlbumPhotos;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeder PRODUKSI sekali-jalan.
 *
 * Membuat DUA akun untuk deploy produksi pertama:
 *   1. admin_nuraloka  — akun administrator.
 *   2. nuravers_juara  — akun "completed all": memiliki SELURUH lencana
 *      (8 kategori × 4 tingkat + 4 lencana khusus = 36 lencana) sehingga
 *      berada di level tertinggi. Berguna sebagai contoh tampilan penuh.
 *
 * IDEMPOTENT. Aman dijalankan berkali-kali: setiap akun dilewati bila email-nya
 * sudah ada, dan data referensi (provinsi/level/lencana/tempat) hanya diseed
 * bila tabelnya masih kosong. Jadi menjalankannya ulang di deploy berikutnya
 * TIDAK menggandakan apa pun dan TIDAK menghapus data pengguna.
 *
 * BUKAN bagian dari DatabaseSeeder (yang dipakai `migrate:fresh --seed` untuk
 * demo/dev). Jalankan sendiri saat pertama kali menyiapkan produksi:
 *
 *     php artisan db:seed --class=ProductionUserSeeder --force
 *
 * Kata sandi bisa di-set lewat env agar tidak hard-coded; bila tak diisi memakai
 * default di bawah — GANTI setelah login pertama:
 *     SEED_ADMIN_PASSWORD, SEED_SHOWCASE_PASSWORD
 */
class ProductionUserSeeder extends Seeder
{
    use SeedsAlbumPhotos;

    private const ADMIN_EMAIL = 'admin@nuraloka.id';

    private const SHOWCASE_EMAIL = 'juara@nuraloka.id';

    public function run(): void
    {
        // "Completed all" mustahil tanpa data acuan: provinsi (FK wajib di
        // user_details), level, lencana, dan tempat+kategori (sumber lencana
        // bertingkat). Diseed di sini HANYA bila tabelnya masih kosong, sehingga
        // tetap sekali-jalan dan tidak mengganggu data yang sudah ada.
        $this->ensureReferenceData();

        $gamification = app(GamificationService::class);

        $this->seedAdmin();
        $this->seedCompletionist($gamification);
    }

    /** Seed data acuan yang belum ada (idempotent per-tabel). */
    private function ensureReferenceData(): void
    {
        $needed = [
            'provinces' => ProvinceSeeder::class,
            'levels' => LevelSeeder::class,
            'badges' => BadgeSeeder::class,
            'missions' => MissionSeeder::class,
            'categories' => CategorySeeder::class,
            'places' => PlaceSeeder::class,
        ];

        foreach ($needed as $table => $seeder) {
            if (DB::table($table)->count() === 0) {
                $this->command?->info("Menyeed data acuan: {$seeder}");
                $this->call($seeder);
            }
        }
    }

    /** Akun administrator (dilewati bila sudah ada). */
    private function seedAdmin(): void
    {
        if (User::where('email', self::ADMIN_EMAIL)->exists()) {
            $this->command?->warn('Admin sudah ada — dilewati.');

            return;
        }

        $userId = DB::table('users')->insertGetId([
            'username' => 'admin_nuraloka',
            'email' => self::ADMIN_EMAIL,
            'password' => Hash::make(env('SEED_ADMIN_PASSWORD', 'nuraloka2026')),
            'is_admin' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_details')->insert([
            'user_id' => $userId,
            'province_id' => $this->provinceId(),
            'fullname' => 'Administrator NuraLoka',
            'dob' => '1995-01-01',
            'gender' => 'unspecified',
            'profile_path' => null,
            'total_points' => 0,
            'level_id' => Level::idForPoints(0),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command?->info('Admin dibuat: '.self::ADMIN_EMAIL);
    }

    /**
     * Akun "completed all". Membuat aktivitas album NYATA yang menembus tingkat
     * tertinggi (Berlian) di semua kategori, lalu memberi lencananya lewat jalur
     * resmi (syncAlbumBadges) + lencana khusus, dan menghitung ulang poinnya.
     * Poin TIDAK ditulis manual — selalu = jumlah poin lencana yang dimiliki.
     */
    private function seedCompletionist(GamificationService $gamification): void
    {
        if (User::where('email', self::SHOWCASE_EMAIL)->exists()) {
            $this->command?->warn('Akun "completed all" sudah ada — dilewati.');

            return;
        }

        $userId = DB::table('users')->insertGetId([
            'username' => 'nuravers_juara',
            'email' => self::SHOWCASE_EMAIL,
            'password' => Hash::make(env('SEED_SHOWCASE_PASSWORD', 'password123')),
            'is_admin' => false,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_details')->insert([
            'user_id' => $userId,
            'province_id' => $this->provinceId(),
            'fullname' => 'Nuravers Juara',
            'dob' => '2000-01-01',
            'gender' => 'unspecified',
            'profile_path' => null,
            'total_points' => 0,
            'level_id' => Level::idForPoints(0),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->seedFullAlbumCoverage($userId);

        $user = User::find($userId);

        // Lencana bertingkat (8 kategori × 4) dari aktivitas album di atas.
        $gamification->syncAlbumBadges($user);

        // Lencana khusus tidak punya kriteria album — diberikan langsung, sama
        // seperti ChallengeSeeder memberi Jayadi "Sahabat Nuka".
        foreach (Badge::where('type', 'special')->get() as $badge) {
            DB::table('user_badges')->updateOrInsert(
                ['user_id' => $userId, 'badge_id' => $badge->id],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // Poin & level diturunkan dari lencana yang benar-benar dimiliki.
        $points = $gamification->recalculatePoints($user);

        $owned = DB::table('user_badges')->where('user_id', $userId)->count();
        $total = Badge::count();
        $this->command?->info("Akun \"completed all\" dibuat: ".self::SHOWCASE_EMAIL." — {$owned}/{$total} lencana, {$points} poin.");
    }

    /**
     * Buat 30 album berisi foto yang mencakup SEMUA tempat di katalog, cukup
     * untuk menembus tingkat Berlian di tiap kategori:
     *   - tiap kategori tempat terwakili penuh (distinct place per kategori maks),
     *   - ≥ 30 tempat berbeda   → Si Paling Penjelajah (Berlian = 30),
     *   - ≥ 50 foto             → Si Paling Cerita (Berlian = 50),
     *   - 30 album              → Si Paling Trip (Berlian = 30).
     */
    private function seedFullAlbumCoverage(int $userId): void
    {
        $places = DB::table('places')
            ->select('id', 'name', 'latitude', 'longitude')
            ->get();

        if ($places->isEmpty()) {
            $this->command?->warn('Tidak ada tempat di katalog — lencana bertingkat tidak bisa diraih.');

            return;
        }

        $albumCount = 30;
        $albumIds = [];

        for ($t = 1; $t <= $albumCount; $t++) {
            $primary = $places[($t - 1) % $places->count()];
            $title = 'Jelajah '.$primary->name;

            $tripId = DB::table('trips')->insertGetId([
                'user_id' => $userId,
                'title' => $title,
                'slug' => Str::slug('nuravers-juara-trip-'.$t),
                'origin_name' => 'Jakarta',
                'origin_latitude' => -6.17536700,
                'origin_longitude' => 106.82716400,
                'destination_name' => $primary->name,
                'destination_latitude' => $primary->latitude,
                'destination_longitude' => $primary->longitude,
                'trip_date' => now()->subDays($t)->toDateString(),
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Dibuat lewat model agar HasSlug menurunkan slug dari judul album,
            // sama seperti album buatan pengguna.
            $albumIds[] = \App\Models\Album::create([
                'trip_id' => $tripId,
                'caption' => $title,
                'view_count' => 0,
            ])->id;
        }

        // Rangkai daftar foto: setiap tempat minimal sekali (mencakup semua
        // kategori + tempat unik), diulang hingga menembus ≥ 50 foto untuk
        // Si Paling Cerita. Sebar merata ke 30 album.
        $placeIds = $places->pluck('id')->all();
        $minPhotos = max(54, count($placeIds));

        $photoRows = [];
        for ($i = 0; $i < $minPhotos; $i++) {
            $placeId = $placeIds[$i % count($placeIds)];
            $albumId = $albumIds[$i % $albumCount];
            $photoPath = $this->seedAlbumPhoto($i);

            if ($photoPath === null) {
                continue;
            }

            $photoRows[] = [
                'album_id' => $albumId,
                'place_id' => $placeId,
                'photo_path' => $photoPath,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($photoRows !== []) {
            DB::table('trip_photos')->insert($photoRows);
        }
    }

    /** Id provinsi untuk akun seed — DKI Jakarta bila ada, jika tidak provinsi pertama. */
    private function provinceId(): int
    {
        return (int) (DB::table('provinces')->where('name', 'DKI Jakarta')->value('id')
            ?? DB::table('provinces')->min('id'));
    }
}
