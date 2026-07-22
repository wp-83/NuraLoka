<?php

namespace Database\Seeders;

use App\Models\Album;
use Database\Seeders\Concerns\SeedsAlbumPhotos;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlbumSeeder extends Seeder
{
    use SeedsAlbumPhotos;

    /**
     * Seed albums dan trip_photos untuk setiap trip yang sudah ada.
     * photo_path diisi foto contoh yang filenya benar-benar disalin ke storage
     * (lihat SeedsAlbumPhotos), dan place_id diisi tempat NYATA agar
     * auto-deteksi lencana per kategori (GamificationService::syncAlbumBadges)
     * punya data yang benar-benar berarti.
     */
    public function run(): void
    {
        // Trip hasOne Album — lewati trip yang albumnya sudah dibuat seeder lain
        // (mis. ChallengeSeeder) agar tidak ada album ganda per trip.
        $trips = DB::table('trips')
            ->whereNotIn('id', DB::table('albums')->pluck('trip_id'))
            ->get();

        $placeIds = DB::table('places')->pluck('id')->all();

        if (empty($placeIds)) {
            return;
        }

        foreach ($trips as $trip) {
            // Dibuat lewat model, BUKAN DB::table(), supaya HasSlug ikut jalan dan
            // slug-nya berasal dari judul album — sama persis dengan album buatan
            // pengguna. Insert mentah melewati event model, sehingga dulu slug
            // harus dirakit tangan dan formatnya jadi berbeda.
            $albumId = Album::create([
                'trip_id' => $trip->id,
                'caption' => $trip->title,
                'view_count' => rand(100, 5000),
                'created_at' => $trip->created_at,
                'updated_at' => $trip->updated_at,
            ])->id;

            // Prioritaskan Place yang namanya cocok dengan destinasi trip.
            $primaryPlaceId = DB::table('places')->where('name', $trip->destination_name)->value('id');

            // Buat 3-5 foto per album
            $photoCount = rand(3, 5);
            for ($i = 1; $i <= $photoCount; $i++) {
                $photoPath = $this->seedAlbumPhoto($albumId + $i);

                DB::table('trip_photos')->insert([
                    'album_id' => $albumId,
                    'place_id' => $primaryPlaceId ?? $placeIds[array_rand($placeIds)],
                    'photo_path' => $photoPath,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
