<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Perjalanan dua titik (POST /jelajah/perjalanan).
 *
 * Titik keberangkatan dan tujuan tidak boleh sama. Frontend sudah menolaknya
 * saat pemilihan titik, tapi endpoint-nya bisa dipanggil langsung — tanpa
 * penjagaan di server, trip berjarak nol beserta album sistem "Trip X → X"
 * tetap masuk database.
 */
class JourneyTwoPointTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(float $destLat, float $destLng): array
    {
        return [
            'origin_name' => 'Titik Awal',
            'origin_lat' => -6.2000,
            'origin_lng' => 106.8000,
            'destination_name' => 'Titik Tujuan',
            'destination_lat' => $destLat,
            'destination_lng' => $destLng,
            // Disamakan dengan tujuan supaya verifikasi jarak check-in lolos,
            // baik journey_demo_mode menyala maupun mati.
            'user_lat' => $destLat,
            'user_lng' => $destLng,
        ];
    }

    public function test_titik_keberangkatan_dan_tujuan_yang_sama_ditolak(): void
    {
        $user = User::factory()->create();
        $jumlahTrip = Trip::count();
        $jumlahAlbum = Album::count();

        $this->actingAs($user)
            ->postJson(route('explore.journey'), $this->payload(-6.2000, 106.8000))
            ->assertStatus(422)
            ->assertJson(['ok' => false]);

        $this->assertSame($jumlahTrip, Trip::count(), 'Trip berjarak nol tidak boleh tersimpan.');
        $this->assertSame($jumlahAlbum, Album::count(), 'Album sistem tidak boleh dibuat untuk perjalanan yang ditolak.');
    }

    public function test_dua_titik_yang_berjarak_beberapa_meter_juga_dianggap_sama(): void
    {
        // ~11 m dari titik awal: satu tempat yang sama bisa muncul dua kali di
        // hasil Nominatim dengan koordinat yang meleset beberapa meter.
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('explore.journey'), $this->payload(-6.2001, 106.8000))
            ->assertStatus(422)
            ->assertJson(['ok' => false]);
    }

    public function test_dua_titik_yang_benar_benar_berbeda_tetap_diterima(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('explore.journey'), $this->payload(-6.2100, 106.8100))
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseHas('trips', [
            'user_id' => $user->id,
            'origin_name' => 'Titik Awal',
            'destination_name' => 'Titik Tujuan',
        ]);
    }
}
