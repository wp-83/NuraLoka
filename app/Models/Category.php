<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // relationships
    public function places()
    {
        return $this->belongsToMany(Place::class, 'category_places')
            ->withPivot('id')
            ->withTimestamps();
    }
}
