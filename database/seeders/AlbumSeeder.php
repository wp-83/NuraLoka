<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlbumSeeder extends Seeder
{
    /**
     * Seed albums dan trip_photos untuk setiap trip yang sudah ada.
     * Menggunakan placeholder photo_path karena belum ada file foto asli.
     */
    public function run(): void
    {
        $trips = DB::table('trips')->get();

        foreach ($trips as $trip) {
            // Buat album untuk setiap trip
            $albumId = DB::table('albums')->insertGetId([
                'trip_id' => $trip->id,
                'caption' => $trip->title,
                'view_count' => rand(100, 5000),
                'created_at' => $trip->created_at,
                'updated_at' => $trip->updated_at,
            ]);

            // Buat 3-5 foto placeholder per album
            $photoCount = rand(3, 5);
            for ($i = 1; $i <= $photoCount; $i++) {
                DB::table('trip_photos')->insert([
                    'album_id' => $albumId,
                    'place_id' => null,
                    'photo_path' => "album-photos/placeholder-{$trip->id}-{$i}.jpg",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
