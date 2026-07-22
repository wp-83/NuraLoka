<?php

namespace App\Services;

use App\Models\Place;
use App\Models\TripPhoto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Builds the props for a PLACE DETAIL page.
 *
 * The detail page under Explore and the one under Wishlist show exactly the same
 * thing, so both build their data here and cannot drift apart.
 */
class PlaceDetailPresenter
{
    /** Album photos shown in the gallery, most-viewed album first. */
    private const GALLERY_ALBUM_PHOTO_LIMIT = 20;

    /**
     * Every prop the PlaceDetail component needs.
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
            'albumPostersCount' => $this->albumPostersCount($place),
        ];
    }

    /**
     * The photo gallery, combining:
     *  1. photos uploaded by an admin (the photos relation → photo_place pivot);
     *  2. users' photos from public albums tagged with this place, most-viewed
     *     album first.
     *
     * @return list<array{id: string, url: string}>
     */
    public function galleryFor(Place $place): array
    {
        $adminPhotos = $place->photos->map(fn ($photo) => [
            'id' => 'admin-'.$photo->id,
            'url' => '/storage/'.$photo->path,
        ]);

        $albumPhotos = $this->visibleAlbumPhotos($place)
            ->orderByDesc('albums.view_count')
            ->limit(self::GALLERY_ALBUM_PHOTO_LIMIT)
            ->get(['trip_photos.id', 'trip_photos.photo_path'])
            ->map(fn ($photo) => [
                'id' => 'album-'.$photo->id,
                'url' => '/storage/'.$photo->photo_path,
            ]);

        return $adminPhotos->concat($albumPhotos)->values()->all();
    }

    /**
     * How many different people have posted an album about this place.
     *
     * Counted through the same filter as the gallery, so the page can never
     * print "3 albums" above an empty gallery — a number that would itself give
     * away the albums their owners have hidden.
     */
    private function albumPostersCount(Place $place): int
    {
        return $this->visibleAlbumPhotos($place)
            ->distinct('trips.user_id')
            ->count('trips.user_id');
    }

    /**
     * Trip photos of this place that the public may see: from public albums
     * belonging to users who are not banned.
     */
    private function visibleAlbumPhotos(Place $place)
    {
        return TripPhoto::query()
            ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
            ->join('trips', 'trips.id', '=', 'albums.trip_id')
            ->join('users', 'users.id', '=', 'trips.user_id')
            ->where('trip_photos.place_id', $place->id)
            ->where('trips.is_public', true)
            ->where('users.is_banned', false);
    }
}
