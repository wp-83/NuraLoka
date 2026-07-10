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

    // Relationships
    public function places()
    {
        return $this->belongsToMany(Place::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function userDetails()
    {
        return $this->hasOne(UserDetail::class);
    }

    public function missions()
    {
        return $this->belongsToMany(Mission::class)
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

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
