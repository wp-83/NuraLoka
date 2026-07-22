<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Level;
use App\Models\User;
use App\Services\GamificationService;
use Database\Seeders\Concerns\SeedsAlbumPhotos;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * ChallengeSeeder
 *
 * Seeds leaderboard demo users matching the prototype design:
 * 10 users with specific names, points, and badge assignments.
 * Also seeds user_missions progress data for the logged-in demo user.
 */
class ChallengeSeeder extends Seeder
{
    use SeedsAlbumPhotos;

    public function run(): void
    {
        // ── Leaderboard Users (matching prototype gambar 4) ─────────────
        $leaderboardUsers = [
            ['fullname' => 'Ade Herlambang Sasongko', 'username' => 'ade_herlambang', 'email' => 'ade.herlambang@nuraloka.id', 'points' => 12250, 'gender' => 'male', 'province_id' => 11],
            ['fullname' => 'Widianto Aliyonugroho', 'username' => 'widianto_aliyo', 'email' => 'widianto.aliyo@nuraloka.id', 'points' => 10500, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Rani Assalam', 'username' => 'rani_assalam', 'email' => 'rani.assalam@nuraloka.id', 'points' => 7000, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Muhammad Rizonous Hadi', 'username' => 'rizonous_hadi', 'email' => 'rizonous.hadi@nuraloka.id', 'points' => 6950, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Ersono Setiawan', 'username' => 'ersono_setiawan', 'email' => 'ersono.setiawan@nuraloka.id', 'points' => 6250, 'gender' => 'male', 'province_id' => 13],
            ['fullname' => 'Martha Pertiwi Widyoningsih', 'username' => 'martha_pertiwi', 'email' => 'martha.pertiwi@nuraloka.id', 'points' => 5000, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Anderies Susanto', 'username' => 'anderies_susanto', 'email' => 'anderies.susanto@nuraloka.id', 'points' => 4950, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Bella Azurian', 'username' => 'bella_azurian', 'email' => 'bella.azurian@nuraloka.id', 'points' => 4900, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Bambang Gandaria', 'username' => 'bambang_gandaria', 'email' => 'bambang.gandaria@nuraloka.id', 'points' => 2900, 'gender' => 'male', 'province_id' => 13],
            ['fullname' => 'Mulyani Sri Handayani', 'username' => 'mulyani_sri', 'email' => 'mulyani.sri@nuraloka.id', 'points' => 2850, 'gender' => 'female', 'province_id' => 12],
        ];

        // Also add a second "Jayadi" user for the search demo (gambar 5)
        $searchDemoUser = [
            'fullname' => 'Jayadi Christoper Wicaksono',
            'username' => 'jayadi_wicaksono',
            'email' => 'jayadi.wicaksono@nuraloka.id',
            'points' => 1500,
            'gender' => 'male',
            'province_id' => 11,
        ];

        $allUsers = array_merge($leaderboardUsers, [$searchDemoUser]);

        $places = DB::table('places')->select('id', 'name', 'latitude', 'longitude')->get()->all();

        foreach ($allUsers as $userData) {
            // Check if user already exists
            $existingUser = DB::table('users')->where('email', $userData['email'])->first();
            if ($existingUser) {
                continue;
            }

            $userId = DB::table('users')->insertGetId([
                'username' => $userData['username'],
                'email' => $userData['email'],
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_details')->insert([
                'user_id' => $userId,
                'province_id' => $userData['province_id'],
                'fullname' => $userData['fullname'],
                'dob' => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
                'gender' => $userData['gender'],
                'profile_path' => null,
                // Poin TIDAK ditetapkan di sini. Satu-satunya sumber poin adalah
                // lencana yang benar-benar dimiliki user — kalau ditulis manual,
                // total_points tidak akan cocok dengan lencana yang tampil di
                // profil. 'points' di atas hanya menakar berapa banyak aktivitas
                // album yang dibuat, sehingga lencananya berbeda-beda per user.
                'total_points' => 0,
                'level_id' => Level::idForPoints(0),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Beri aktivitas album NYATA proporsional dengan poin (bukan lencana acak) —
            // GamificationService::syncAlbumBadges() di bawah yang menghitung & memberi
            // lencana bertingkat dari kriteria sesungguhnya (tempat & foto per kategori).
            if (! empty($places)) {
                // 'points' bukan poin final — hanya penakar SEBERAPA BANYAK aktivitas
                // album yang dibuat, sehingga lencana (dan poin yang dihitung darinya)
                // berbeda-beda antar user.
                //
                // Pembaginya diperkecil dari 1500 dan batasnya dinaikkan dari 6:
                // dengan 6 trip user cuma mengumpulkan ±18 foto, tidak cukup untuk
                // menembus tingkat Perak ke atas, sehingga seluruh leaderboard
                // mentok di gelar yang sama.
                $tripCount = min(20, max(1, intdiv($userData['points'], 700)));

                for ($t = 1; $t <= $tripCount; $t++) {
                    // Pilih tempat lebih dulu supaya judul & tujuan trip memakai
                    // nama tempat NYATA (bukan placeholder "-").
                    $picked = collect($places)->shuffle()->take(min(3, count($places)))->values();
                    $primary = $picked->first();
                    $title = 'Jelajah '.$primary->name;

                    $tripId = DB::table('trips')->insertGetId([
                        'user_id' => $userId,
                        'title' => $title,
                        'slug' => Str::slug($userData['username'].'-trip-'.$t),
                        'origin_name' => 'Jakarta',
                        'origin_latitude' => -6.17536700,
                        'origin_longitude' => 106.82716400,
                        'destination_name' => $primary->name,
                        'destination_latitude' => $primary->latitude,
                        'destination_longitude' => $primary->longitude,
                        'trip_date' => now()->subDays(rand(1, 200))->toDateString(),
                        'is_public' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Dibuat lewat model supaya HasSlug menurunkan slug dari judul
                    // album. Sebelumnya slug dirakit dari username ("budi-album-1")
                    // sehingga sama sekali tidak mencerminkan judulnya.
                    $albumId = Album::create([
                        'trip_id' => $tripId,
                        'caption' => $title,
                        'view_count' => rand(10, 500),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])->id;

                    foreach ($picked as $i => $place) {
                        $photoPath = $this->seedAlbumPhoto($albumId + $i);

                        DB::table('trip_photos')->insert([
                            'album_id' => $albumId,
                            'place_id' => $place->id,
                            'photo_path' => $photoPath,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // Berikan lencana bertingkat dari aktivitas album di atas.
        //
        // recalculatePoints() SENGAJA tidak dipanggil di sini: fungsi itu menyetel
        // total_points = jumlah poin lencana, sehingga poin rancangan tiap user
        // (12250, 10500, ...) hilang dan semua orang jatuh ke ±350 poin alias
        // "Perintis". Poinnya sudah ditetapkan saat user_details dibuat di atas;
        // level_id disamakan lagi di akhir DatabaseSeeder.
        $gamification = app(GamificationService::class);
        foreach ($allUsers as $userData) {
            $user = User::where('username', $userData['username'])->first();
            if ($user) {
                $gamification->syncAlbumBadges($user);
            }
        }

        // ── Seed user_missions progress for Jayadi Christopher Alam (main demo user) ──
        $jayadi = DB::table('users')
            ->where('username', 'jayadi_christopher')
            ->first();

        if ($jayadi) {
            // Poin prototipe (150) tidak di-set manual: berasal dari lencana yang
            // diberikan di bawah — Sahabat Nuka (100) + Kuliner Perunggu (50).

            // Assign ongoing missions with progress data
            $kulinerPerakMission = DB::table('missions')
                ->where('title', 'Si Paling Kuliner (Perak)')
                ->first();
            $ceritaPerungguMission = DB::table('missions')
                ->where('title', 'Si Paling Cerita (Perunggu)')
                ->first();

            if ($kulinerPerakMission) {
                DB::table('user_missions')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'mission_id' => $kulinerPerakMission->id],
                    ['progress' => 7, 'status' => 'on_going', 'created_at' => now(), 'updated_at' => now()]
                );
            }

            if ($ceritaPerungguMission) {
                DB::table('user_missions')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'mission_id' => $ceritaPerungguMission->id],
                    ['progress' => 3, 'status' => 'on_going', 'created_at' => now(), 'updated_at' => now()]
                );
            }

            // Give Jayadi the Sahabat Nuka badge
            $sahabatNuka = DB::table('badges')->where('name', 'Sahabat Nuka')->first();
            if ($sahabatNuka) {
                DB::table('user_badges')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'badge_id' => $sahabatNuka->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }

            // Give Jayadi the Kuliner Perunggu badge (already earned)
            $kulinerPerunggu = DB::table('badges')->where('name', 'Si Paling Kuliner (Perunggu)')->first();
            if ($kulinerPerunggu) {
                DB::table('user_badges')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'badge_id' => $kulinerPerunggu->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }

            // Jayadi berasal dari UserSeeder (total_points 0), jadi poinnya memang
            // harus datang dari lencana — di sinilah recalculatePoints tepat dipakai.
            $gamification->recalculatePoints(User::find($jayadi->id));
        }
    }
}
