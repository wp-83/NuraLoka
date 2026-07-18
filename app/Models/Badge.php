<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Badge extends Model
{
    use HasSlug;

    protected $fillable = [
        'name',
        'requirement_description',
        'icon_path',
        'slug',
        'type',
        'category',
        'points',
        'tier_level',
        'tier_target',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function missions()
    {
        return $this->hasMany(Mission::class);
    }
}
