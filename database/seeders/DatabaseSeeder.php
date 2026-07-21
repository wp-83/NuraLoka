<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\User;
use App\Models\UserDetail;
use App\Services\GamificationService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProvinceSeeder::class,
            LevelSeeder::class, // Must run before any seeder assigning level_id from points.
            BadgeSeeder::class,
            MissionSeeder::class, // Needs badges to link badge_id.
            // Kategori & tempat REAL Jabodetabek.
            // CategorySeeder harus lebih dulu: PlaceSeeder memetakan kategori
            // berdasarkan urutan insert kategori.
            CategorySeeder::class,
            PlaceSeeder::class,
            UserSeeder::class, // 10 user Jabodetabek realistis (province_id, level_id disinkronkan dari poin).
            ChallengeSeeder::class, // Leaderboard users + progres misi user demo (jayadi_christopher).
            TripSeeder::class, // 20 trip realistis untuk user non-admin.
            SavedPlaceSeeder::class, // Saved places untuk fitur "Trending Places".
            AlbumSeeder::class, // Album & foto trip untuk setiap trip.
            MissionActionSeeder::class, // Tautkan misi ke aksi user (gamifikasi dinamis).
            PlaceVisitSeeder::class,
            NewsSeeder::class,
        ]);

        // Hitung ulang lencana bertingkat dari album setiap user (mis. UserSeeder's
        // users baru dapat album lewat TripSeeder+AlbumSeeder di atas), lalu setel
        // total_points = jumlah poin lencana yang benar-benar dimiliki. Urutannya
        // penting: sinkron lencana dulu, baru poin dihitung dari hasil akhirnya.
        // Setara `php artisan badges:sync` — dijalankan otomatis di akhir seeding.
        //
        // Berlaku untuk SEMUA user tanpa kecuali: total_points selalu = jumlah poin
        // lencana yang benar-benar dimiliki. Tidak ada poin yang ditulis manual,
        // supaya angka di leaderboard selalu cocok dengan lencana di profil.
        $gamification = app(GamificationService::class);

        User::query()->get()->each(function (User $user) use ($gamification) {
            $gamification->syncAlbumBadges($user);
            $gamification->recalculatePoints($user);
        });

        // recalculatePoints() sudah menyetel level_id, tapi langkah ini menjaga
        // seandainya ada user yang lolos (mis. belum punya user_detail saat itu).
        UserDetail::query()->get()->each(function (UserDetail $detail) {
            $detail->level_id = Level::idForPoints((int) $detail->total_points);
            $detail->save();
        });
    }
}
