<?php

namespace App\Services;

use App\Models\Place;
use App\Models\TripPhoto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Menyusun data halaman DETAIL TEMPAT.
 *
 * Halaman detail di Jelajah dan di Impian menampilkan hal yang sama persis, jadi
 * datanya pun harus datang dari satu tempat. Sebelumnya WishlistController hanya
 * mengirim place/isSaved/totalSaves, sehingga halaman Impian kehilangan galeri
 * asli, jumlah pengunjung, jumlah album, dan rentang harga.
 */
class PlaceDetailPresenter
{
    /**
     * Seluruh props yang dibutuhkan komponen PlaceDetail.
     *
     * @return array<string, mixed>
     */
    public function props(Place $place, ?User $user = null): array
    {
        $place->loadMissing(['categories', 'photos']);

        return [
            'place' => $place,
            'gallery' => $this->galleryFor($place),
            'isSaved' => $user
                ? $user->savedPlaces()->where('place_id', $place->id)->exists()
                : false,
            'totalSaves' => DB::table('saved_places')
                ->where('place_id', $place->id)
                ->count(),
            'visitorsCount' => DB::table('place_visits')
                ->where('place_id', $place->id)
                ->count(),
            'albumPostersCount' => DB::table('trip_photos')
                ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
                ->join('trips', 'trips.id', '=', 'albums.trip_id')
                ->where('trip_photos.place_id', $place->id)
                ->distinct('trips.user_id')
                ->count('trips.user_id'),
        ];
    }

    /**
     * Galeri foto untuk halaman detail place, gabungan dari:
     *  1. Foto yang diunggah admin (relasi photos → pivot photo_place).
     *  2. Foto milik user dari album POPULER yang menandai tempat ini
     *     (reuse logika "populer": album publik, user tak dibanned, urut view_count).
     *
     * @return list<array{id: string, url: string}>
     */
    public function galleryFor(Place $place): array
    {
        $adminPhotos = $place->photos
            ->map(fn ($ph) => [
                'id' => 'admin-'.$ph->id,
                'url' => '/storage/'.$ph->path,
            ]);

        $albumPhotos = TripPhoto::query()
            ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
            ->join('trips', 'trips.id', '=', 'albums.trip_id')
            ->join('users', 'users.id', '=', 'trips.user_id')
            ->where('trip_photos.place_id', $place->id)
            ->where('trips.is_public', true)
            ->where('users.is_banned', false)
            ->orderByDesc('albums.view_count')
            ->limit(20)
            ->get(['trip_photos.id', 'trip_photos.photo_path'])
            ->map(fn ($ph) => [
                'id' => 'album-'.$ph->id,
                'url' => '/storage/'.$ph->photo_path,
            ]);

        return $adminPhotos->concat($albumPhotos)->values()->all();
    }
}
