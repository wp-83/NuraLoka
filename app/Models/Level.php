<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Level extends Model
{
    use HasSlug;

    protected $fillable = [
        'name',
        'slug',
        'min_points',
        'order',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    public function userDetails()
    {
        return $this->hasMany(UserDetail::class);
    }

    /** Resolve the id of the highest level whose min_points a given point total satisfies. */
    public static function idForPoints(int $points): ?int
    {
        return static::query()
            ->where('min_points', '<=', $points)
            ->orderByDesc('order')
            ->value('id');
    }
}
