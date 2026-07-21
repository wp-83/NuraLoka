<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Trip;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Album: slug diturunkan dari judul, dan foto profil penulis
 * memakai sumber yang sama dengan halaman lain.
 */
class AlbumTest extends TestCase
{
    use RefreshDatabase;

    // ── dari AlbumSlugTest ───────────────────────────────────────
    private function makeAlbum(string $title): Album
    {
        $user = User::factory()->create();

        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => $title,
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
            'caption' => $title,
            'view_count' => 0,
        ]);
    }

    public function test_slug_dibuat_dari_judul_album(): void
    {
        $album = $this->makeAlbum('Liburan Seru di Pantai Kuta');

        $this->assertSame('liburan-seru-di-pantai-kuta', $album->slug);
    }

    public function test_slug_mengikuti_judul_meski_caption_berbeda(): void
    {
        $user = User::factory()->create();

        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => 'Menyusuri Malioboro',
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => 'Yogyakarta',
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => now()->toDateString(),
            'is_public' => true,
        ]);

        // caption sengaja dibuat berbeda dari judul.
        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => 'catatan pribadi yang tidak relevan',
            'view_count' => 0,
        ]);

        $this->assertSame('menyusuri-malioboro', $album->slug);
    }

    public function test_judul_kembar_menghasilkan_slug_unik(): void
    {
        $first = $this->makeAlbum('Trip ke Bromo');
        $second = $this->makeAlbum('Trip ke Bromo');

        $this->assertSame('trip-ke-bromo', $first->slug);
        $this->assertNotSame($first->slug, $second->slug);
        $this->assertStringStartsWith('trip-ke-bromo', $second->slug);
    }

    public function test_slug_ikut_berubah_saat_judul_diperbarui(): void
    {
        $album = $this->makeAlbum('Judul Lama');
        $this->assertSame('judul-lama', $album->slug);

        $album->trip->update(['title' => 'Judul Baru Sekali']);

        $album->setRelation('trip', $album->trip->fresh());
        $album->caption = 'Judul Baru Sekali';
        $album->slug = null;
        $album->save();

        $this->assertSame('judul-baru-sekali', $album->fresh()->slug);
    }

    public function test_menyimpan_ulang_tanpa_mengubah_judul_tidak_mengubah_slug(): void
    {
        // Penting: kalau slug ikut berubah setiap kali baris album disimpan
        // (mis. saat view_count naik), URL album akan berpindah-pindah.
        $album = $this->makeAlbum('Pantai Parangtritis');
        $original = $album->slug;

        $album->increment('view_count');
        $album->save();

        $this->assertSame($original, $album->fresh()->slug);
    }

    /**
     * Menjalankan SELURUH rangkaian seeder — termasuk ChallengeSeeder, yang
     * dulu merakit slug dari username ("budi-album-1") sehingga sama sekali
     * lepas dari judul album.
     */
    public function test_seluruh_album_hasil_seeder_memakai_slug_dari_judul(): void
    {

        $albums = Album::with('trip')->get();

        $this->assertGreaterThan(0, $albums->count());

        foreach ($albums as $album) {
            $expected = Str::slug($album->trip->title);

            $this->assertStringStartsWith(
                $expected,
                $album->slug,
                "Album #{$album->id} slug \"{$album->slug}\" tidak berasal dari judul \"{$album->trip->title}\"."
            );
        }
    }

    // ── dari AlbumAuthorPhotoTest ────────────────────────────────
    private function albumMilikOrangLain(User $penonton): Album
    {
        return Album::whereHas('trip', fn ($q) => $q->where('user_id', '!=', $penonton->id))
            ->with('trip.user')
            ->first();
    }

    public function test_foto_penulis_sama_dengan_public_profile_photo(): void
    {
        $penonton = User::whereHas('userDetail')->first();
        $album = $this->albumMilikOrangLain($penonton);

        $this->assertNotNull($album, 'Tidak ada album milik user lain.');

        $props = $this->actingAs($penonton)
            ->get(route('album.show', $album->slug))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertSame(
            $album->trip->user->public_profile_photo,
            $props['author']['profile_path'],
            'Foto penulis album berbeda dari public_profile_photo.'
        );
    }

    public function test_foto_penulis_berupa_url_bukan_path_mentah(): void
    {
        $penonton = User::whereHas('userDetail')->first();
        $album = $this->albumMilikOrangLain($penonton);

        $props = $this->actingAs($penonton)
            ->get(route('album.show', $album->slug))
            ->viewData('page')['props'];

        $foto = $props['author']['profile_path'];

        $this->assertNotEmpty($foto, 'Foto penulis kosong.');

        // public_profile_photo selalu URL penuh; path mentah tidak diawali http.
        $this->assertStringStartsWith('http', $foto);
    }

    public function test_user_tanpa_foto_dapat_avatar_sesuai_gender(): void
    {
        $penonton = User::whereHas('userDetail')->first();

        // Pastikan penulis album tidak punya foto profil.
        $album = $this->albumMilikOrangLain($penonton);
        $penulis = $album->trip->user;

        UserDetail::where('user_id', $penulis->id)->update([
            'profile_path' => null,
            'gender' => 'female',
        ]);

        $props = $this->actingAs($penonton)
            ->get(route('album.show', $album->slug))
            ->viewData('page')['props'];

        $this->assertStringContainsString(
            'user-female.png',
            $props['author']['profile_path'],
            'User perempuan tanpa foto tidak mendapat avatar perempuan.'
        );
    }

    public function test_frontend_tidak_menempelkan_storage_lagi(): void
    {
        // Server sudah mengirim URL penuh; menempelkan /storage/ akan merusaknya.
        foreach (['Show', 'Index'] as $halaman) {
            $source = file_get_contents(resource_path("js/Pages/Album/{$halaman}.jsx"));

            $this->assertDoesNotMatchRegularExpression(
                '/function getProfileImage\([^)]*\)\s*\{\s*return \w+\s*\?\s*`\/storage\//',
                $source,
                "Album/{$halaman}.jsx masih menempelkan /storage/ pada foto profil."
            );
        }
    }
}
