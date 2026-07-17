<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaceOsmRef extends Model
{
    protected $fillable = ['place_id', 'osm_id', 'subtype'];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
