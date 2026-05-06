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
            CategorySeeder::class,
            PlaceSeeder::class,
            UserSeeder::class,        // <-- users + details + badges + missions
        ]);
    }
}