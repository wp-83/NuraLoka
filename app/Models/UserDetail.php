<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
