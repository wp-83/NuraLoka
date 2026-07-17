<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProvinceSeeder::class,
            BadgeSeeder::class,
            MissionSeeder::class,
            // Kategori & tempat REAL Jabodetabek (menggantikan seeder dummy factory).
            // XullCategorySeeder harus lebih dulu: XullPlaceSeeder memetakan kategori
            // berdasarkan urutan insert kategori.
            XullCategorySeeder::class,
            XullPlaceSeeder::class,
            UserSeeder::class,
            ChallengeSeeder::class, // Added ChallengeSeeder
            PlaceVisitSeeder::class,
            NewsSeederFW::class,
        ]);
    }
}
