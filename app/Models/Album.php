<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Album extends Model
{
    use HasSlug;

    protected $guarded = ['id'];

    /**
     * Slug diambil dari JUDUL album.
     *
     * Judul album tinggal di trips.title (lihat getTitleAttribute), bukan di
     * kolom albums.caption. Sebelumnya slug dibuat dari 'caption', sehingga
     * begitu judul diubah lewat AlbumController::update — yang hanya menyentuh
     * trip — slug dan caption tertinggal memakai judul lama.
     *
     * Memakai closure, bukan nama kolom, supaya sumbernya selalu judul yang
     * sedang berlaku. caption dipakai sebagai cadangan kalau relasi trip belum
     * ada (mis. saat album dibuat sebelum trip ter-assign).
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(fn (Album $album) => $album->trip?->title ?: $album->caption)
            ->saveSlugsTo('slug');
    }

    // Relationships
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    // Accessor: get user through trip
    public function getUserAttribute()
    {
        return $this->trip?->user;
    }

    // Accessor: get title from trip
    public function getTitleAttribute()
    {
        return $this->trip?->title;
    }

    // Accessor: get location from trip destination
    public function getLocationAttribute()
    {
        return $this->trip?->destination_name;
    }

    // Accessor: get date from trip
    public function getDateAttribute()
    {
        return $this->trip?->trip_date;
    }

    // Accessor: get visibility from trip
    public function getIsPublicAttribute()
    {
        return $this->trip?->is_public;
    }
}
