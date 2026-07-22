<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Place extends Model
{
    use HasFactory;
    use HasSlug;

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'latitude',
        'longitude',
        'address',
        'source',
        'min_price',
        'max_price',
    ];

    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_places')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_places')
            ->withTimestamps();
    }

    public function visits()
    {
        return $this->hasMany(PlaceVisit::class);
    }

    /** Photos an admin attached to this place (the photo_place pivot). */
    public function photos()
    {
        return $this->belongsToMany(Photo::class, 'photo_place')
            ->withTimestamps();
    }

    /** Where this place came from in OSM (present only when source = 'osm'). */
    public function osmRef()
    {
        return $this->hasOne(PlaceOsmRef::class);
    }

    /** Trip photos tagged as taken at this place (from users' albums). */
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    /**
     * The trip photos ANYONE may see: only those from public albums belonging to
     * users who are not banned.
     *
     * The raw tripPhotos relation knows nothing about privacy, even though album
     * privacy is stored on trips.is_public (see
     * AlbumController::toggleVisibility). The moment an owner makes an album
     * private, its photos must stop appearing anywhere outside that album —
     * including as the cover of a place card in Explore/Wishlist and in the
     * gallery on a detail page. The rule is written once here so no caller can
     * forget to apply it.
     */
    public function publicTripPhotos()
    {
        return $this->tripPhotos()
            ->whereHas('album.trip', function ($q) {
                $q->where('is_public', true)
                    ->whereHas('user', fn ($uq) => $uq->where('is_banned', false));
            });
    }

    /**
     * The cover photo for a place card (PlaceCard) — null when the place has no
     * photo at all, which makes the card fall back to its default image.
     *
     * The search order matches the gallery on the detail page:
     *   1. photos uploaded by an admin (the photos relation);
     *   2. users' photos from PUBLIC albums tagged with this place
     *      (publicTripPhotos — a private album never becomes a cover).
     *
     * Reads from an ALREADY-LOADED relation when there is one, so rendering a
     * row of cards does not fire an extra query per card (N+1). Eager-load with
     * ->with(['photos', 'publicTripPhotos']) before using it across many places.
     */
    public function getImgAttribute(): ?string
    {
        $adminPhoto = $this->relationLoaded('photos')
            ? $this->photos->first()
            : $this->photos()->first();

        if ($adminPhoto?->path) {
            return '/storage/'.$adminPhoto->path;
        }

        $tripPhoto = $this->relationLoaded('publicTripPhotos')
            ? $this->publicTripPhotos->first()
            : $this->publicTripPhotos()->first();

        if ($tripPhoto?->photo_path) {
            return '/storage/'.$tripPhoto->photo_path;
        }

        return null;
    }
}
