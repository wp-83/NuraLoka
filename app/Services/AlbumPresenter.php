<?php

namespace App\Services;

use App\Models\Album;
use Illuminate\Support\Collection;

/**
 * Builds the array shape an album takes when it is handed to the frontend.
 *
 * An album card looks the same everywhere it appears — the album index, the
 * "all albums" list, a public profile, the home page — so the shape is built in
 * one place. It used to be a private method on AlbumController plus two
 * hand-written copies (HomeController and ProfileController) that had already
 * drifted apart: the profile copy had no view_count and no author, so the same
 * album rendered differently depending on which page you reached it from.
 *
 * An album's title, location, date and visibility live on its trip, and its
 * cover comes from the first trip photo, so callers must eager-load
 * ['trip.user.userDetails', 'tripPhotos'] — see Album::scopeWithCardData().
 */
class AlbumPresenter
{
    /**
     * Everything a card needs to render, including the author.
     *
     * @return array<string, mixed>
     */
    public function card(Album $album): array
    {
        $trip = $album->trip;
        $firstPhoto = $album->tripPhotos->first();

        return [
            'id' => $album->id,
            'slug' => $album->slug,
            'title' => $trip->title,
            'location' => $trip->destination_name,
            // The place tag lives on the photos, not on the album, so the first
            // photo stands for the album as a whole.
            'place_id' => $firstPhoto?->place_id,
            'date' => $trip->trip_date,
            'is_public' => (bool) $trip->is_public,
            'is_system' => (bool) $trip->is_system,
            'view_count' => $album->view_count,
            'caption' => $album->caption,
            'thumbnail' => $firstPhoto?->photo_path,
            'photo_count' => $album->tripPhotos->count(),
            'user_id' => $trip->user_id,
            'author_name' => $trip->user?->userDetails?->fullname
                ?? $trip->user?->username
                ?? '-',
            // A ready-made URL that already falls back to a gender-appropriate
            // default avatar (see User::getPublicProfilePhotoAttribute), so a
            // user without a photo looks the same here as in the navbar.
            'author_profile' => $trip->user?->public_profile_photo,
        ];
    }

    /**
     * The same cards for a whole collection.
     *
     * @param  Collection<int, Album>  $albums
     * @return Collection<int, array<string, mixed>>
     */
    public function cards($albums)
    {
        return $albums->map(fn (Album $album) => $this->card($album));
    }

    /**
     * The photos of one album, shaped for the gallery components.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function photos(Album $album)
    {
        return $album->tripPhotos->map(fn ($photo) => [
            'id' => $photo->id,
            'photo_path' => $photo->photo_path,
            'filename' => basename((string) $photo->photo_path),
        ]);
    }
}
