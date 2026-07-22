<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = [
        'id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected $appends = [
        'public_profile_photo',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // profile picture
    public function getPublicProfilePhotoAttribute()
    {
        if ($this->userDetail?->profile_path) {
            return asset('storage/'.$this->userDetail->profile_path);
        }

        // Null-safe: a user may not have a user_details row yet (freshly
        // created, or a system account). Without this the whole user
        // serialization fails fatally — and since 'public_profile_photo' is in
        // $appends, that happens on nearly every page, logout included.
        return match ($this->userDetail?->gender) {
            'male' => asset('images/defaults/user-male.png'),
            'female' => asset('images/defaults/user-female.png'),
            default => asset('images/defaults/profile-general.png'),
        };
    }

    // Relationships
    public function places()
    {
        return $this->belongsToMany(Place::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function userDetail()
    {
        return $this->hasOne(UserDetail::class);
    }

    /**
     * Alias for userDetail relationship (plural form).
     */
    public function userDetails()
    {
        return $this->userDetail();
    }

    public function missions()
    {
        return $this->belongsToMany(Mission::class, 'user_missions')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function trips()
    {
        return $this->belongsToMany(Trip::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function news()
    {
        return $this->hasMany(News::class);
    }

    public function savedPlaces()
    {
        return $this->belongsToMany(Place::class, 'saved_places')
            ->withTimestamps();
    }

    public function albums()
    {
        return $this->hasManyThrough(Album::class, Trip::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
