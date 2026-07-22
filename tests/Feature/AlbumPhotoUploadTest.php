<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Unggah foto album (buat album & tambah foto di halaman ubah):
 * batas 10MB per foto, dikompres ke WebP, dan error ditampilkan.
 */
class AlbumPhotoUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function makeAlbum(User $user): Album
    {
        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => 'Album Unggah Foto',
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => 'Bandung',
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => now()->toDateString(),
            'is_public' => true,
        ]);

        return Album::create([
            'trip_id' => $trip->id,
            'caption' => $trip->title,
            'view_count' => 0,
        ]);
    }

    /** Berkas gambar asli berukuran kira-kira $kilobytes. */
    private function photo(string $name, int $kilobytes): UploadedFile
    {
        return UploadedFile::fake()->create($name, $kilobytes, 'image/jpeg');
    }

    private function realPhoto(string $name = 'foto.jpg'): UploadedFile
    {
        return UploadedFile::fake()->image($name, 2000, 1500);
    }

    /** Foto milik album yang baru saja dibuat user (database test sudah berisi data seeder). */
    private function photosOf(User $user): int
    {
        return TripPhoto::whereHas('album.trip', fn ($q) => $q->where('user_id', $user->id))->count();
    }

    public function test_foto_sampai_10mb_diterima_saat_membuat_album(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('album.store'), [
                'title' => 'Album Sepuluh Mega',
                'location' => 'Bandung',
                'date' => now()->toDateString(),
                'photos' => [$this->realPhoto()],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('album.index'));

        $this->assertSame(1, $this->photosOf($user));
    }

    public function test_foto_lebih_dari_10mb_ditolak_dengan_pesan(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('album.store'), [
                'title' => 'Album Kebesaran',
                'location' => 'Bandung',
                'date' => now()->toDateString(),
                'photos' => [$this->photo('besar.jpg', 10241)],
            ])
            ->assertSessionHasErrors('photos.0');

        $this->assertSame(0, $this->photosOf($user));

        $pesan = session('errors')->first('photos.0');
        $this->assertSame(__('album.photo_error_size', ['max' => 10]), $pesan);
    }

    public function test_foto_disimpan_terkompres_sebagai_webp(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('album.store'), [
            'title' => 'Album Kompresi',
            'location' => 'Bandung',
            'date' => now()->toDateString(),
            'photos' => [$this->realPhoto('besar-sekali.jpg')],
        ])->assertSessionHasNoErrors();

        $path = TripPhoto::whereHas('album.trip', fn ($q) => $q->where('user_id', $user->id))
            ->value('photo_path');

        $this->assertStringEndsWith('.webp', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_tambah_foto_di_halaman_ubah_memakai_batas_yang_sama(): void
    {
        $user = User::factory()->create();
        $album = $this->makeAlbum($user);

        // Terlalu besar → ditolak.
        $this->actingAs($user)
            ->post(route('album.photo.add', $album->slug), [
                'photos' => [$this->photo('besar.jpg', 10241)],
            ])
            ->assertSessionHasErrors('photos.0');

        $this->assertSame(0, $album->tripPhotos()->count());

        // Masih dalam batas → diterima dan ikut dikompres.
        $this->actingAs($user)
            ->post(route('album.photo.add', $album->slug), [
                'photos' => [$this->realPhoto()],
            ])
            ->assertSessionHasNoErrors();

        $this->assertStringEndsWith('.webp', $album->tripPhotos()->first()->photo_path);
    }

    public function test_berkas_bukan_gambar_ditolak(): void
    {
        $user = User::factory()->create();
        $album = $this->makeAlbum($user);

        $this->actingAs($user)
            ->post(route('album.photo.add', $album->slug), [
                'photos' => [UploadedFile::fake()->create('catatan.pdf', 100, 'application/pdf')],
            ])
            ->assertSessionHasErrors('photos.0');

        $this->assertSame(
            __('album.photo_error_type'),
            session('errors')->first('photos.0')
        );
    }
}
