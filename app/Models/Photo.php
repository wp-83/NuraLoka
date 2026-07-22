<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = ['path', 'uploaded_by'];

    /** The places using this photo (the photo_place pivot). */
    public function places()
    {
        return $this->belongsToMany(Place::class, 'photo_place')
            ->withTimestamps();
    }

    /** The admin who uploaded it. */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
