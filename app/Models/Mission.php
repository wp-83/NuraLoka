<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Mission extends Model
{
    use HasSlug;

    protected $fillable = [
        'title',
        'description',
        'points_reward',
        'target',
        'badge_id',
        'slug',
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
        return $this->belongsToMany(User::class, 'user_missions')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }
}
