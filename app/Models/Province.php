<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    // Relationship
    public function userDetails()
    {
        return $this->hasMany(UserDetail::class);
    }
}
