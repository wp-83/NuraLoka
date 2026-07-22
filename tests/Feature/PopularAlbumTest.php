<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\AlbumView;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * "Album populer minggu ini" di halaman Beranda dan halaman Album.
 *
 * Dulu peringkatnya menyaring trips.trip_date >= minggu lalu lalu mengurutkan
 * pakai view_count (total sepanjang masa). Album lama yang ramai dilihat minggu
 * ini karena itu tidak pernah muncul. Test di bawah menjaga agar yang dihitung
 * adalah view yang benar-benar terjadi dalam 7 hari terakhir.
 */
class PopularAlbumTest extends TestCase
{
    use RefreshDatabase;

    private function makeAlbum(string $title, string $tripDate, int $viewCount = 0, bool $isPublic = true): Album
    {
        $trip = Trip::create([
            'user_id' => User::factory()->create()->id,
            'title' => $title,
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => 'Bandung',
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => $tripDate,
            'is_public' => $isPublic,
        ]);

        return Album::create([
            'trip_id' => $trip->id,
            'caption' => $title,
            'view_count' => $viewCount,
        ]);
    }

    private function recordViews(Album $album, int $count, string $when): void
    {
        for ($i = 0; $i < $count; $i++) {
            AlbumView::create([
                'album_id' => $album->id,
                'user_id' => User::factory()->create()->id,
                'viewed_at' => $when,
            ]);
        }
    }

    /** Peringkat murni dari view minggu ini, bukan dari tanggal trip. */
    private function ranking(): array
    {
        return Album::popularThisWeek()->pluck('albums.id')->all();
    }

    public function test_album_lama_dengan_view_minggu_ini_tetap_masuk_peringkat(): void
    {
        // Trip-nya dua bulan lalu — dulu tersaring habis oleh filter trip_date.
        $albumLama = $this->makeAlbum('Trip Dua Bulan Lalu', now()->subMonths(2)->toDateString());
        $this->recordViews($albumLama, 10, now()->subDays(2));

        $ranking = $this->ranking();

        $this->assertContains($albumLama->id, $ranking);
        $this->assertSame($albumLama->id, $ranking[0], 'Album dengan view terbanyak minggu ini harus berada di puncak.');
    }

    public function test_view_lebih_dari_seminggu_lalu_tidak_dihitung(): void
    {
        $ramaiMingguIni = $this->makeAlbum('Ramai Minggu Ini', now()->toDateString());
        $ramaiDuluSekali = $this->makeAlbum('Ramai Bulan Lalu', now()->toDateString());

        $this->recordViews($ramaiMingguIni, 3, now()->subDay());
        $this->recordViews($ramaiDuluSekali, 50, now()->subMonth());

        $ranking = $this->ranking();

        $this->assertLessThan(
            array_search($ramaiDuluSekali->id, $ranking, true),
            array_search($ramaiMingguIni->id, $ranking, true),
            'View bulan lalu tidak boleh mengalahkan view minggu ini.'
        );
    }

    public function test_album_privat_dan_user_dibanned_tidak_muncul(): void
    {
        $privat = $this->makeAlbum('Album Privat', now()->toDateString(), isPublic: false);
        $this->recordViews($privat, 20, now());

        $dibanned = $this->makeAlbum('Album User Dibanned', now()->toDateString());
        $dibanned->trip->user->update(['is_banned' => true]);
        $this->recordViews($dibanned, 20, now());

        $ranking = $this->ranking();

        $this->assertNotContains($privat->id, $ranking);
        $this->assertNotContains($dibanned->id, $ranking);
    }

    public function test_membuka_album_orang_lain_mencatat_view_berstempel_waktu(): void
    {
        $album = $this->makeAlbum('Album Dilihat', now()->toDateString());
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
        $album = $this->makeAlbum('Album Sendiri', now()->toDateString());

        $this->actingAs($album->trip->user)
            ->get(route('album.show', $album->slug))
            ->assertOk();

        $this->assertDatabaseMissing('album_views', ['album_id' => $album->id]);
        $this->assertSame(0, $album->fresh()->view_count);
    }

    public function test_beranda_dan_halaman_album_memakai_peringkat_yang_sama(): void
    {
        $teratas = $this->makeAlbum('Paling Ramai', now()->subMonths(3)->toDateString());
        $this->recordViews($teratas, 30, now()->subDays(3));

        $penonton = User::factory()->create();

        $beranda = $this->actingAs($penonton)->get(route('home.index'))
            ->viewData('page')['props']['popularAlbums'];
        $halamanAlbum = $this->actingAs($penonton)->get(route('album.index'))
            ->viewData('page')['props']['popularAlbums'];

        $this->assertSame($teratas->id, $beranda[0]['id']);
        $this->assertSame($teratas->id, $halamanAlbum[0]['id']);
    }
}
