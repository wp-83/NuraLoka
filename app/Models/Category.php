<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // relationships
    public function places()
    {
        return $this->belongsToMany(Place::class, 'category_places')
            ->withPivot('id')
            ->withTimestamps();
    }
}
