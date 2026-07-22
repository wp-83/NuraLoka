<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * "Album populer minggu ini" di halaman Beranda dan halaman Album.
 *
 * Aturannya: album publik yang DIBUAT dalam 7 hari terakhir, diurutkan dari
 * jumlah penonton (albums.view_count — angka yang tercetak di kartu album).
 * Kalau jumlah penontonnya sama, album yang lebih dulu dibuat menang.
 *
 * Dulu batas "minggu ini" diambil dari trips.trip_date dan urutannya dihitung
 * dari view 7 hari terakhir, sementara kartunya menampilkan view_count total —
 * urutan yang muncul di layar karena itu terlihat acak.
 */
class PopularAlbumTest extends TestCase
{
    use RefreshDatabase;

    private function makeAlbum(
        string $title,
        int $viewCount = 0,
        ?string $createdAt = null,
        ?string $tripDate = null,
        bool $isPublic = true,
    ): Album {
        $trip = Trip::create([
            'user_id' => User::factory()->create()->id,
            'title' => $title,
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => 'Bandung',
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => $tripDate ?? now()->toDateString(),
            'is_public' => $isPublic,
        ]);

        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $title,
            'view_count' => $viewCount,
        ]);

        if ($createdAt !== null) {
            // Timestamp tidak bisa lewat create(): Eloquent menimpanya dengan
            // now(). Kolomnya di-update langsung supaya umur album benar-benar
            // terkontrol oleh test.
            $album->forceFill(['created_at' => $createdAt])->saveQuietly();
        }

        return $album->fresh();
    }

    private function ranking(): array
    {
        return Album::popularThisWeek()->pluck('albums.id')->all();
    }

    /**
     * Peringkat yang sudah disaring hanya untuk album milik test ini.
     *
     * DatabaseSeeder ikut mengisi tabel albums (dan album-album itu juga dibuat
     * "minggu ini" karena seeding berjalan saat test dimulai), jadi peringkat
     * mentahnya tidak pernah hanya berisi album buatan test. Yang diuji adalah
     * urutan RELATIF antar album yang dibuat di sini.
     */
    private function rankingOf(Album ...$albums): array
    {
        $ids = array_map(fn (Album $album) => $album->id, $albums);

        return array_values(array_filter(
            $this->ranking(),
            fn ($id) => in_array($id, $ids, true),
        ));
    }

    public function test_album_diurutkan_dari_jumlah_penonton_terbanyak(): void
    {
        $sepi = $this->makeAlbum('Sepi', viewCount: 3);
        $ramai = $this->makeAlbum('Ramai', viewCount: 40);
        $sedang = $this->makeAlbum('Sedang', viewCount: 12);

        $this->assertSame(
            [$ramai->id, $sedang->id, $sepi->id],
            $this->rankingOf($sepi, $ramai, $sedang),
        );
    }

    public function test_jumlah_penonton_sama_dimenangkan_album_yang_lebih_dulu_dibuat(): void
    {
        // Dibuat belakangan, tapi diurut lebih dulu di database supaya lulusnya
        // benar-benar karena created_at, bukan karena urutan insert.
        $termuda = $this->makeAlbum('Termuda', viewCount: 10, createdAt: now()->subDay());
        $tertua = $this->makeAlbum('Tertua', viewCount: 10, createdAt: now()->subDays(5));
        $tengah = $this->makeAlbum('Tengah', viewCount: 10, createdAt: now()->subDays(3));

        $this->assertSame(
            [$tertua->id, $tengah->id, $termuda->id],
            $this->rankingOf($termuda, $tertua, $tengah),
            'Saat jumlah penontonnya seri, album tertua harus berada di atas.',
        );
    }

    public function test_jumlah_penonton_mengalahkan_umur_album(): void
    {
        $tuaTapiSepi = $this->makeAlbum('Tua Tapi Sepi', viewCount: 1, createdAt: now()->subDays(6));
        $mudaTapiRamai = $this->makeAlbum('Muda Tapi Ramai', viewCount: 50, createdAt: now()->subHour());

        $this->assertSame(
            [$mudaTapiRamai->id, $tuaTapiSepi->id],
            $this->rankingOf($tuaTapiSepi, $mudaTapiRamai),
        );
    }

    public function test_album_yang_dibuat_lebih_dari_seminggu_lalu_tidak_masuk(): void
    {
        $mingguIni = $this->makeAlbum('Dibuat Minggu Ini', viewCount: 2, createdAt: now()->subDays(2));
        $bulanLalu = $this->makeAlbum('Dibuat Bulan Lalu', viewCount: 999, createdAt: now()->subMonth());

        $this->assertSame(
            [$mingguIni->id],
            $this->rankingOf($mingguIni, $bulanLalu),
            'Album yang dibuat lebih dari seminggu lalu tidak boleh ikut, sebanyak apa pun penontonnya.',
        );
    }

    public function test_yang_membatasi_adalah_tanggal_album_dibuat_bukan_tanggal_trip(): void
    {
        // Album baru tentang perjalanan bulan lalu — dulu tersaring habis oleh
        // filter trips.trip_date.
        $tripLamaAlbumBaru = $this->makeAlbum(
            'Trip Bulan Lalu, Album Baru',
            viewCount: 5,
            createdAt: now()->subDay(),
            tripDate: now()->subMonth()->toDateString(),
        );

        $this->assertContains($tripLamaAlbumBaru->id, $this->ranking());
    }

    public function test_album_privat_dan_user_dibanned_tidak_muncul(): void
    {
        $privat = $this->makeAlbum('Album Privat', viewCount: 20, isPublic: false);

        $dibanned = $this->makeAlbum('Album User Dibanned', viewCount: 20);
        $dibanned->trip->user->update(['is_banned' => true]);

        $ranking = $this->ranking();

        $this->assertNotContains($privat->id, $ranking);
        $this->assertNotContains($dibanned->id, $ranking);
    }

    public function test_membuka_album_orang_lain_menambah_jumlah_penonton(): void
    {
        $album = $this->makeAlbum('Album Dilihat');
        $penonton = User::factory()->create();

        $this->actingAs($penonton)
            ->get(route('album.show', $album->slug))
            ->assertOk();

        $this->assertDatabaseHas('album_views', [
            'album_id' => $album->id,
            'user_id' => $penonton->id,
        ]);
        $this->assertSame(1, $album->fresh()->view_count);
    }

    public function test_pemilik_membuka_albumnya_sendiri_tidak_menambah_view(): void
    {
        $album = $this->makeAlbum('Album Sendiri');

        $this->actingAs($album->trip->user)
            ->get(route('album.show', $album->slug))
            ->assertOk();

        $this->assertDatabaseMissing('album_views', ['album_id' => $album->id]);
        $this->assertSame(0, $album->fresh()->view_count);
    }

    public function test_beranda_dan_halaman_album_memakai_peringkat_yang_sama(): void
    {
        // Angkanya sengaja jauh di atas apa pun yang diisi DatabaseSeeder
        // supaya album ini pasti berada di puncak kedua halaman.
        $teratas = $this->makeAlbum('Paling Ramai', viewCount: 1_000_000, createdAt: now()->subDays(3));
        $this->makeAlbum('Kurang Ramai', viewCount: 4, createdAt: now()->subDay());

        $penonton = User::factory()->create();

        $beranda = $this->actingAs($penonton)->get(route('home.index'))
            ->viewData('page')['props']['popularAlbums'];
        $halamanAlbum = $this->actingAs($penonton)->get(route('album.index'))
            ->viewData('page')['props']['popularAlbums'];

        $this->assertSame($teratas->id, $beranda[0]['id']);
        $this->assertSame($teratas->id, $halamanAlbum[0]['id']);
    }
}
