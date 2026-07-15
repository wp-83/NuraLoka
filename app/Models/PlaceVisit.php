<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaceVisit extends Model
{
    protected $fillable = [
        'user_id', 'place_id', 'latitude', 'longitude', 'visited_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'visited_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
