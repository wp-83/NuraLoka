<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class XullSavedPlaceSeeder extends Seeder
{
    /**
     * Membuat data saved_places (tempat-tempat yang disimpan user).
     * Data ini digunakan untuk fitur "Trending Places".
     */
    public function run(): void
    {
        $userIds = DB::table('users')->pluck('id')->toArray();
        $placeIds = DB::table('places')->pluck('id')->toArray();

        if (empty($userIds) || empty($placeIds)) {
            return;
        }

        // Tentukan 5 tempat yang akan dibuat seolah-olah "sangat tren"
        $trendingPlaces = array_slice($placeIds, 0, 5); // 5 tempat pertama
        $normalPlaces = array_slice($placeIds, 5);

        $savedPlaces = [];

        foreach ($userIds as $userId) {
            // Sebagian besar user nge-save tempat trending ini
            foreach ($trendingPlaces as $tpId) {
                // Probabilitas tinggi untuk disimpan
                if (rand(1, 100) <= 80) {
                    $savedPlaces[] = [
                        'user_id' => $userId,
                        'place_id' => $tpId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // User juga nge-save beberapa tempat random secara acak
            $randomSavesCount = rand(1, 4);
            $randomKeys = array_rand($normalPlaces, $randomSavesCount);
            if (! is_array($randomKeys)) {
                $randomKeys = [$randomKeys];
            }

            foreach ($randomKeys as $k) {
                $savedPlaces[] = [
                    'user_id' => $userId,
                    'place_id' => $normalPlaces[$k],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Hindari duplikasi jika script dijalankan ulang menggunakan array unique filter atau insertOrIgnore
        // Sayangnya array keys bisa duplikat saat kita merge, jadi gunakan insertOrIgnore. Tapi raw array ini perlu di filter by user_id & place_id.
        foreach ($savedPlaces as $sp) {
            DB::table('saved_places')->updateOrInsert(
                ['user_id' => $sp['user_id'], 'place_id' => $sp['place_id']],
                ['created_at' => $sp['created_at'], 'updated_at' => $sp['updated_at']]
            );
        }
    }
}
