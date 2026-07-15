<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OsmPlace extends Model
{
    protected $fillable = [
        'osm_id', 'name', 'latitude', 'longitude',
        'address', 'category', 'subtype',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}
