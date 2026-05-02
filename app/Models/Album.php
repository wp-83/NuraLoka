<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    // Relationships
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
