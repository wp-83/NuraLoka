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
        'name', 'slug', 'description',
        'latitude', 'longitude', 'address', 'source',
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
}
