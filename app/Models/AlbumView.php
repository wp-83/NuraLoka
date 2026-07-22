<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A single album view. Written by AlbumController::show so the
 * "popular this week" ranking can count views inside a date range.
 */
class AlbumView extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
