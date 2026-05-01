<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }
}
