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

    /** Foto yang dilampirkan admin ke tempat ini (pivot photo_place). */
    public function photos()
    {
        return $this->belongsToMany(Photo::class, 'photo_place')
            ->withTimestamps();
    }

    /** Referensi asal OSM (hanya ada bila source = 'osm'). */
    public function osmRef()
    {
        return $this->hasOne(PlaceOsmRef::class);
    }

    /** Foto trip yang ditandai berada di tempat ini (dari album pengguna). */
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    /**
     * Foto sampul untuk kartu tempat (PlaceCard) — null bila tempat ini belum
     * punya foto sama sekali, sehingga kartunya memakai gambar bawaan.
     *
     * Urutan pencarian sama dengan galeri di halaman detail:
     *   1. foto unggahan admin (relasi photos);
     *   2. foto milik pengguna dari album yang menandai tempat ini.
     *
     * Diambil dari relasi yang SUDAH dimuat bila ada, supaya menampilkan
     * sederet kartu tidak memicu kueri tambahan per kartu (N+1). Muat dengan
     * ->with(['photos', 'tripPhotos']) sebelum memakainya untuk banyak tempat.
     */
    public function getImgAttribute(): ?string
    {
        $adminPhoto = $this->relationLoaded('photos')
            ? $this->photos->first()
            : $this->photos()->first();

        if ($adminPhoto?->path) {
            return '/storage/'.$adminPhoto->path;
        }

        $tripPhoto = $this->relationLoaded('tripPhotos')
            ? $this->tripPhotos->first()
            : $this->tripPhotos()->first();

        if ($tripPhoto?->photo_path) {
            return '/storage/'.$tripPhoto->photo_path;
        }

        return null;
    }
}
