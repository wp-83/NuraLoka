<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * A photo album, always attached to exactly one trip.
 *
 * The trip owns the descriptive data — title, destination, date, visibility and
 * the user it belongs to — while this row owns the photos and the view counter.
 * The accessors at the bottom expose the trip's fields under album-shaped names
 * so callers do not have to know about that split.
 */
class Album extends Model
{
    use HasSlug;

    protected $guarded = ['id'];

    /**
     * The slug is built from the album's TITLE.
     *
     * That title lives on trips.title (see getTitleAttribute), not in the
     * albums.caption column. The slug used to be generated from 'caption', so
     * renaming an album through AlbumController::update — which only touches the
     * trip — left both the slug and the caption on the old title.
     *
     * A closure is used rather than a column name so the source is always the
     * title currently in effect. The caption is the fallback for the moment
     * before a trip has been assigned (an album built ahead of its trip).
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(fn (Album $album) => $album->trip?->title ?: $album->caption)
            ->saveSlugsTo('slug');
    }

    /**
     * "Popular this week": public albums, owned by active users, CREATED in the
     * last 7 days (albums.created_at), ordered by their audience —
     * albums.view_count, the very number printed on the album card. Older albums
     * win a tie.
     *
     * Two things used to put this list in the wrong order:
     *
     * 1. The "this week" cutoff was read from trips.trip_date — the date of the
     *    outing, not the date the album was posted. An album uploaded today
     *    about last month's trip therefore never appeared.
     * 2. The ordering counted album_views rows from the last 7 days while the
     *    card displayed the lifetime view_count, so an album showing a smaller
     *    number could sit above one showing a larger number and the order looked
     *    random. What sorts the list is now the number people actually see.
     *
     * The window rolls over 7 days (now()->subWeek()) rather than resetting on
     * Monday, so the list does not empty out at the start of each week. When
     * there genuinely are no new albums the page falls back to its empty state
     * ('album.popular_empty').
     *
     * Ordering by created_at ASC also keeps the result stable between requests;
     * albums.id settles rows with identical timestamps.
     */
    public function scopePopularThisWeek(Builder $query): Builder
    {
        return $query
            ->where('albums.created_at', '>=', now()->subWeek())
            ->whereHas('trip', function (Builder $trip) {
                $trip->where('is_public', true)
                    ->whereHas('user', fn (Builder $user) => $user->where('is_banned', false));
            })
            ->orderByDesc('albums.view_count')
            ->orderBy('albums.created_at')
            ->orderBy('albums.id');
    }

    /**
     * Albums belonging to one user. Ownership lives on the trip, which is why
     * this cannot be a plain where() on the album row.
     */
    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->whereHas('trip', fn (Builder $trip) => $trip->where('user_id', $userId));
    }

    /**
     * Albums their owner has left public. Visibility is a property of the trip
     * (see AlbumController::toggleVisibility).
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->whereHas('trip', fn (Builder $trip) => $trip->where('is_public', true));
    }

    /**
     * Eager-loads exactly what AlbumPresenter::card() reads. Without it, showing
     * a row of cards costs several queries per card.
     */
    public function scopeWithCardData(Builder $query): Builder
    {
        return $query->with(['trip.user.userDetails', 'tripPhotos']);
    }

    /** Newest album first — the order every album listing uses. */
    public function scopeNewestFirst(Builder $query): Builder
    {
        return $query->orderByDesc('created_at');
    }

    // Relationships
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function views()
    {
        return $this->hasMany(AlbumView::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    /** The owner, reached through the trip. */
    public function getUserAttribute()
    {
        return $this->trip?->user;
    }

    /** The title, which is stored on the trip. */
    public function getTitleAttribute()
    {
        return $this->trip?->title;
    }

    /** The location, which is the trip's destination. */
    public function getLocationAttribute()
    {
        return $this->trip?->destination_name;
    }

    /** The date, which is the trip's date. */
    public function getDateAttribute()
    {
        return $this->trip?->trip_date;
    }

    /** The visibility, which is the trip's. */
    public function getIsPublicAttribute()
    {
        return $this->trip?->is_public;
    }
}
