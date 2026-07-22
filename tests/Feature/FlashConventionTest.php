<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Place;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Notifikasi kecil (Flash) benar-benar sampai ke pengguna.
 *
 * HandleInertiaRequests hanya membagikan 'flash.type' dan 'flash.message', jadi
 * DUA kunci itu satu-satunya jalan pesan sampai ke layar. `->with('success', …)`
 * tetap diterima Laravel tanpa error, tapi pesannya masuk ke kunci yang tidak
 * dibaca siapa pun — aksinya jadi diam-diam saja.
 */
class FlashConventionTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::whereHas('userDetail')->where('is_banned', false)->firstOrFail();
    }

    public function test_tidak_ada_controller_yang_memakai_kunci_flash_yang_salah(): void
    {
        $salah = [];

        foreach (glob(app_path('Http/Controllers/**/*.php')) + glob(app_path('Http/Controllers/*.php')) as $file) {
            // Komentar dibuang dulu: dokumentasi helper flash() sendiri memuat
            // contoh cara yang SALAH, dan itu bukan pemakaian sungguhan.
            $isi = $this->tanpaKomentar(file_get_contents($file));

            foreach (['success', 'error', 'warning', 'info'] as $type) {
                if (str_contains($isi, "->with('{$type}',")) {
                    $salah[] = basename($file)." memakai ->with('{$type}', …)";
                }
            }
        }

        $this->assertSame(
            [],
            $salah,
            "Pesan ini tidak akan pernah tampil. Pakai ->with(\$this->flash('success', …)):\n"
                .implode("\n", $salah)
        );
    }

    /** Kode PHP tanpa komentar dan docblock. */
    private function tanpaKomentar(string $source): string
    {
        $kode = '';

        foreach (token_get_all($source) as $token) {
            if (is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
                continue;
            }

            $kode .= is_array($token) ? $token[1] : $token;
        }

        return $kode;
    }

    public function test_simpan_dan_hapus_tempat_impian_memberi_notifikasi(): void
    {
        $user = $this->user();
        $place = Place::firstOrFail();

        $user->savedPlaces()->detach($place->id);

        $this->actingAs($user)
            ->post(route('wishlist.toggle'), ['place_id' => $place->id])
            ->assertSessionHas('flash.type', 'success')
            ->assertSessionHas('flash.message');

        $this->actingAs($user)
            ->post(route('wishlist.toggle'), ['place_id' => $place->id])
            ->assertSessionHas('flash.type', 'success')
            ->assertSessionHas('flash.message');
    }

    public function test_mengubah_privasi_album_memberi_notifikasi(): void
    {
        $user = $this->user();

        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => 'Album Uji Notifikasi',
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => 'Bandung',
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => now()->toDateString(),
            'is_public' => true,
        ]);

        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $trip->title,
            'view_count' => 0,
        ]);

        $this->actingAs($user)
            ->post(route('album.toggle.visibility', $album->slug))
            ->assertSessionHas('flash.type', 'success')
            ->assertSessionHas('flash.message');

        $this->assertFalse((bool) $trip->fresh()->is_public);
    }
}
