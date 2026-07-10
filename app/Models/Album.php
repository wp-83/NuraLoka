<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    protected $guarded = ['id'];

    // Relationships
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    // Accessor: get user through trip
    public function getUserAttribute()
    {
        return $this->trip?->user;
    }

    // Accessor: get title from trip
    public function getTitleAttribute()
    {
        return $this->trip?->title;
    }

    // Accessor: get location from trip destination
    public function getLocationAttribute()
    {
        return $this->trip?->destination_name;
    }

    // Accessor: get date from trip
    public function getDateAttribute()
    {
        return $this->trip?->trip_date;
    }

    // Accessor: get visibility from trip
    public function getIsPublicAttribute()
    {
        return $this->trip?->is_public;
    }
}
