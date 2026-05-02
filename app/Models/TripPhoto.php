<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripPhoto extends Model
{
    // Relationships
    public function album()
    {
        return $this->belongsTo(Album::class);
    }
}
