<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = ['path', 'uploaded_by'];

    /** Tempat-tempat yang memakai foto ini (pivot photo_place). */
    public function places()
    {
        return $this->belongsToMany(Place::class, 'photo_place')
            ->withTimestamps();
    }

    /** User (admin) yang mengunggah. */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
