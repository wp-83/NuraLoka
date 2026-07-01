<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * XullDatabaseSeeder
 *
 * Orchestrator untuk semua seeder data final NuraLoka.
 * Urutan eksekusi penting — ikuti dependensi foreign key:
 *   1. ProvinceSeeder  → provinces (tidak ada FK)
 *   2. XullCategorySeeder → categories (tidak ada FK)
 *   3. XullUserSeeder  → users + user_details (FK: province_id)
 *   4. XullPlaceSeeder → places + category_places (FK: category_id, place_id)
 *   5. XullTripSeeder  → trips (FK: user_id)
 *
 * Cara menjalankan:
 *   php artisan db:seed --class=XullDatabaseSeeder
 *
 * Atau reset penuh (hati-hati — menghapus semua data):
 *   php artisan migrate:fresh --seed  (jika XullDatabaseSeeder didaftarkan di DatabaseSeeder)
 */
class XullDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProvinceSeeder::class,
            XullCategorySeeder::class,
            XullUserSeeder::class,
            XullPlaceSeeder::class,
            XullTripSeeder::class,
        ]);
    }
}
