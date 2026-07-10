<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripPhoto extends Model
{
    protected $guarded = ['id'];

    // Relationships
    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
