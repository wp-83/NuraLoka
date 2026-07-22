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
     * "Popular this week": album publik milik user aktif yang DIBUAT dalam 7
     * hari terakhir (albums.created_at), diurutkan dari jumlah penontonnya —
     * albums.view_count, angka yang sama dengan yang tercetak di kartu album.
     * Kalau jumlah penontonnya seri, album yang lebih dulu dibuat menang.
     *
     * Dua hal yang dulu membuat urutannya salah:
     *
     * 1. Batas "minggu ini" diambil dari trips.trip_date — tanggal jalan-jalan,
     *    bukan tanggal album dibuat. Album yang baru diunggah tentang perjalanan
     *    bulan lalu karena itu tidak pernah muncul.
     * 2. Urutannya dihitung dari baris album_views 7 hari terakhir, sementara
     *    kartunya menampilkan view_count total. Album dengan angka view lebih
     *    kecil bisa berada di atas album dengan angka lebih besar, sehingga
     *    urutannya terlihat acak. Sekarang yang mengurutkan adalah angka yang
     *    benar-benar dilihat pengguna.
     *
     * Jendelanya bergulir 7 hari (now()->subWeek()), bukan Senin–Minggu, sama
     * seperti sebelumnya supaya daftar ini tidak kosong mendadak tiap awal
     * pekan. Kalau memang tidak ada album baru minggu ini, halaman memakai
     * empty state ('album.popular_empty').
     *
     * created_at ASC sekaligus membuat urutannya stabil antar-request;
     * albums.id menutup kasus timestamp yang identik.
     */
    public function scopePopularThisWeek($query)
    {
        return $query
            ->where('albums.created_at', '>=', now()->subWeek())
            ->whereHas('trip', function ($q) {
                $q->where('is_public', true)
                    ->whereHas('user', function ($uq) {
                        $uq->where('is_banned', false);
                    });
            })
            ->orderByDesc('albums.view_count')
            ->orderBy('albums.created_at')
            ->orderBy('albums.id');
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
