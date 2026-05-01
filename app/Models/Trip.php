<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    // relationships
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('id')
            ->withTimestamps();
    }
}
