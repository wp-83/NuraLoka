<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Album extends Model
{
    use HasSlug;

    protected $guarded = ['id'];

    /**
     * Slug diambil dari JUDUL album.
     *
     * Judul album tinggal di trips.title (lihat getTitleAttribute), bukan di
     * kolom albums.caption. Sebelumnya slug dibuat dari 'caption', sehingga
     * begitu judul diubah lewat AlbumController::update — yang hanya menyentuh
     * trip — slug dan caption tertinggal memakai judul lama.
     *
     * Memakai closure, bukan nama kolom, supaya sumbernya selalu judul yang
     * sedang berlaku. caption dipakai sebagai cadangan kalau relasi trip belum
     * ada (mis. saat album dibuat sebelum trip ter-assign).
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(fn (Album $album) => $album->trip?->title ?: $album->caption)
            ->saveSlugsTo('slug');
    }

    /**
     * "Popular this week": public albums from active users, ranked by the views
     * they actually received in the last 7 days.
     *
     * Sebelumnya peringkat ini menyaring trips.trip_date >= minggu lalu dan
     * mengurutkan pakai view_count (total sepanjang masa). Akibatnya album lama
     * yang ramai ditonton minggu ini TIDAK pernah muncul — yang tersaring adalah
     * tanggal jalan-jalannya, bukan kapan album itu dilihat. Sekarang tanggal
     * trip tidak lagi membatasi; yang dihitung adalah baris album_views dalam
     * 7 hari terakhir.
     *
     * view_count dipakai sebagai pemecah seri supaya bagian ini tetap terisi
     * ketika belum ada view yang tercatat minggu ini (mis. tepat setelah fitur
     * log view ini dirilis).
     */
    public function scopePopularThisWeek($query)
    {
        return $query
            ->withCount(['views as weekly_views' => function ($q) {
                $q->where('viewed_at', '>=', now()->subWeek());
            }])
            ->whereHas('trip', function ($q) {
                $q->where('is_public', true)
                    ->whereHas('user', function ($uq) {
                        $uq->where('is_banned', false);
                    });
            })
            ->orderByDesc('weekly_views')
            ->orderByDesc('view_count');
    }

    // Relationships
    public function tripPhotos()
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function views()
    {
        return $this->hasMany(AlbumView::class);
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
