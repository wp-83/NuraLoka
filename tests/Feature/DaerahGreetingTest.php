<?php

namespace Tests\Feature;

use App\Services\Daerah\GreetingRepository;
use App\Services\Daerah\GreetingResolver;
use App\Services\Daerah\ProvinceMapper;
use App\Services\Daerah\RegionDetector;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Fitur sapaan bahasa daerah.
 *
 * Fokus pengujian: rantai fallback dan kemandirian dari lokalisasi id/en/ko —
 * dua hal yang paling mudah rusak diam-diam saat file bahasa daerah ditambah.
 */
class DaerahGreetingTest extends TestCase
{
    private function resolver(): GreetingResolver
    {
        return app(GreetingResolver::class);
    }

    public function test_provinsi_memakai_bahasa_daerahnya_sendiri(): void
    {
        $payload = $this->resolver()->build('Jawa Barat');

        $this->assertSame('sunda', $payload['language']);
        $this->assertSame('sunda', $payload['resolved_from']['home_hero']);
    }

    public function test_provinsi_tanpa_terjemahan_mundur_ke_bahasa_pulau(): void
    {
        // Bengkulu dipetakan ke 'rejang', yang belum diterjemahkan, sehingga
        // harus mundur ke bahasa utama Sumatra.
        $payload = $this->resolver()->build('Bengkulu');

        $this->assertSame('rejang', $payload['language']);
        $this->assertSame('melayu-riau', $payload['resolved_from']['home_hero']);
        $this->assertSame(['rejang', 'melayu-riau'], $payload['chain']);
    }

    public function test_provinsi_tidak_pernah_mundur_ke_bahasa_indonesia(): void
    {
        // Inti fitur: begitu wilayahnya diketahui, yang tampil harus bahasa
        // daerah — bukan Bahasa Indonesia. Batas terakhirnya bahasa pulau.
        $default = config('daerah.default', 'indonesia');

        foreach (array_keys(config('daerah.province_island')) as $province) {
            $payload = $this->resolver()->build($province);

            $this->assertNotContains(
                $default,
                $payload['chain'],
                "Rantai {$province} masih memuat Bahasa Indonesia."
            );

            foreach ($payload['resolved_from'] as $key => $language) {
                $this->assertNotSame(
                    $default,
                    $language,
                    "{$province}.{$key} diambil dari Bahasa Indonesia."
                );
            }
        }
    }

    public function test_bahasa_pulau_wajib_lengkap(): void
    {
        // Tanpa jaring pengaman Bahasa Indonesia, bahasa pulau adalah batas
        // terakhir. Kalau ada kunci yang kosong, sapaannya hilang dari halaman.
        $keys = array_keys(app(GreetingRepository::class)->all(config('daerah.default', 'indonesia')));

        foreach (config('daerah.islands') as $island => $language) {
            $available = array_keys(app(GreetingRepository::class)->all($language));

            $this->assertEmpty(
                array_diff($keys, $available),
                "Bahasa pulau {$language} ({$island}) belum lengkap."
            );
        }
    }

    public function test_tidak_ada_frasa_daerah_yang_sama_persis_dengan_indonesia(): void
    {
        // Kalau teksnya sama persis, halaman terlihat tidak berubah dan fitur
        // ini dikira rusak — persis keluhan yang muncul untuk Palembang.
        $repository = app(GreetingRepository::class);
        $default = config('daerah.default', 'indonesia');
        $indonesian = $repository->all($default);

        foreach ($repository->availableLanguages() as $language) {
            if ($language === $default) {
                continue;
            }

            foreach ($repository->all($language) as $key => $value) {
                $this->assertNotSame(
                    $indonesian[$key] ?? null,
                    $value,
                    "{$language}.{$key} masih memakai teks Bahasa Indonesia."
                );
            }
        }
    }

    public function test_tanpa_provinsi_memakai_bahasa_indonesia(): void
    {
        $payload = $this->resolver()->build(null);

        $this->assertNull($payload['province']);
        $this->assertSame('indonesia', $payload['language']);
        $this->assertSame('Mantapkan Langkahmu!', $payload['phrases']['home_hero']);
    }

    public function test_setiap_provinsi_selalu_dapat_seluruh_frasa(): void
    {
        $keys = array_keys(app(GreetingRepository::class)->all('indonesia'));

        foreach (array_keys(config('daerah.province_island')) as $province) {
            $payload = $this->resolver()->build($province);

            foreach ($keys as $key) {
                $this->assertArrayHasKey(
                    $key,
                    $payload['phrases'],
                    "Provinsi {$province} tidak punya frasa untuk '{$key}'."
                );
                $this->assertNotSame('', trim($payload['phrases'][$key]));
            }
        }
    }

    public function test_sapaan_tidak_berubah_saat_bahasa_aplikasi_diganti(): void
    {
        $expected = $this->resolver()->build('Bali')['phrases']['home_hero'];

        foreach (['en', 'ko', 'id'] as $locale) {
            app()->setLocale($locale);

            $this->assertSame(
                $expected,
                $this->resolver()->build('Bali')['phrases']['home_hero'],
                "Sapaan daerah ikut berubah saat locale aplikasi = {$locale}."
            );
        }
    }

    public function test_koordinat_dipetakan_ke_provinsi_terdekat(): void
    {
        // Denpasar
        $payload = $this->resolver()->forCoordinates(-8.65, 115.21);

        $this->assertSame('Bali', $payload['province']);
        $this->assertSame('geolocation', $payload['source']);
    }

    public function test_koordinat_di_luar_indonesia_mundur_ke_default(): void
    {
        // Tokyo
        $payload = $this->resolver()->forCoordinates(35.68, 139.69);

        $this->assertNull($payload['province']);
        $this->assertSame('indonesia', $payload['language']);
    }

    public function test_endpoint_deteksi_mengembalikan_sapaan(): void
    {
        $response = $this->postJson(route('daerah.resolve'), [
            'latitude' => -6.9175,
            'longitude' => 107.6191,
        ]);

        $response->assertOk()
            ->assertJsonPath('province', 'Jawa Barat')
            ->assertJsonPath('language', 'sunda');
    }

    public function test_endpoint_menolak_koordinat_tidak_masuk_akal(): void
    {
        $this->postJson(route('daerah.resolve'), [
            'latitude' => 999,
            'longitude' => 107.6191,
        ])->assertStatus(422);
    }

    /**
     * Koordinat kota-kota nyata → provinsi yang benar.
     *
     * Ini regresi untuk bug pencocokan centroid: dulu Bogor, Depok, Bekasi, dan
     * Tangerang semuanya terbaca DKI Jakarta karena titik tengah Jakarta yang
     * mungil lebih dekat daripada titik tengah Jawa Barat yang jauh di Bandung.
     * Jangan longgarkan daftar ini saat mengubah 'province_bounds'.
     *
     * @return array<string, array{float, float, string}>
     */
    public static function kotaProvider(): array
    {
        return [
            'Jakarta Pusat' => [-6.1862, 106.8341, 'DKI Jakarta'],
            'Bogor' => [-6.5950, 106.7894, 'Jawa Barat'],
            'Depok' => [-6.4025, 106.7942, 'Jawa Barat'],
            'Bekasi' => [-6.2383, 106.9756, 'Jawa Barat'],
            'Tangerang' => [-6.1783, 106.6300, 'Banten'],
            'Serang' => [-6.1200, 106.1503, 'Banten'],
            'Bandung' => [-6.9175, 107.6191, 'Jawa Barat'],
            'Cirebon' => [-6.7063, 108.5571, 'Jawa Barat'],
            'Semarang' => [-6.9667, 110.4167, 'Jawa Tengah'],
            'Solo' => [-7.5755, 110.8243, 'Jawa Tengah'],
            'Yogyakarta' => [-7.7956, 110.3695, 'DI Yogyakarta'],
            'Surabaya' => [-7.2575, 112.7521, 'Jawa Timur'],
            'Malang' => [-7.9666, 112.6326, 'Jawa Timur'],
            'Denpasar' => [-8.6500, 115.2167, 'Bali'],
            'Mataram' => [-8.5833, 116.1167, 'Nusa Tenggara Barat'],
            'Kupang' => [-10.1772, 123.6070, 'Nusa Tenggara Timur'],
            'Medan' => [3.5952, 98.6722, 'Sumatera Utara'],
            'Padang' => [-0.9471, 100.4172, 'Sumatera Barat'],
            'Palembang' => [-2.9761, 104.7754, 'Sumatera Selatan'],
            'Pekanbaru' => [0.5071, 101.4478, 'Riau'],
            'Banda Aceh' => [5.5483, 95.3238, 'Aceh'],
            'Bandar Lampung' => [-5.4294, 105.2610, 'Lampung'],
            'Kota Jambi' => [-1.6101, 103.6131, 'Jambi'],
            'Bengkulu' => [-3.7928, 102.2608, 'Bengkulu'],
            'Pontianak' => [-0.0263, 109.3425, 'Kalimantan Barat'],
            'Banjarmasin' => [-3.3194, 114.5908, 'Kalimantan Selatan'],
            'Samarinda' => [-0.5022, 117.1536, 'Kalimantan Timur'],
            'Balikpapan' => [-1.2379, 116.8529, 'Kalimantan Timur'],
            'Makassar' => [-5.1477, 119.4327, 'Sulawesi Selatan'],
            'Manado' => [1.4748, 124.8421, 'Sulawesi Utara'],
            'Gorontalo' => [0.5435, 123.0568, 'Gorontalo'],
            'Palu' => [-0.8917, 119.8707, 'Sulawesi Tengah'],
            'Kendari' => [-3.9985, 122.5130, 'Sulawesi Tenggara'],
            'Ambon' => [-3.6954, 128.1814, 'Maluku'],
            'Ternate' => [0.7900, 127.3800, 'Maluku Utara'],
            'Jayapura' => [-2.5337, 140.7181, 'Papua'],
            'Manokwari' => [-0.8615, 134.0620, 'Papua Barat'],
            'Sorong' => [-0.8762, 131.2558, 'Papua Barat Daya'],
        ];
    }

    #[DataProvider('kotaProvider')]
    public function test_koordinat_kota_terpetakan_ke_provinsi_yang_benar(
        float $latitude,
        float $longitude,
        string $expected,
    ): void {
        $this->assertSame(
            $expected,
            app(RegionDetector::class)
                ->fromCoordinates($latitude, $longitude),
        );
    }

    public function test_nama_kota_diterima_selain_nama_provinsi(): void
    {
        $mapper = app(ProvinceMapper::class);

        $this->assertSame('Jawa Barat', $mapper->resolveName('Bandung'));
        $this->assertSame('Banten', $mapper->resolveName('Tangerang'));
        $this->assertSame('Jawa Tengah', $mapper->resolveName('Solo'));

        // Tanpa peduli huruf besar/kecil, dan nama provinsi tetap berlaku.
        $this->assertSame('Jawa Barat', $mapper->resolveName('bandung'));
        $this->assertSame('Jawa Barat', $mapper->resolveName('Jawa Barat'));

        $this->assertNull($mapper->resolveName('Atlantis'));
    }

    public function test_setiap_kota_menunjuk_provinsi_yang_dikenal(): void
    {
        $provinces = array_keys(config('daerah.province_island'));

        foreach (config('daerah.cities') as $city => $province) {
            $this->assertContains(
                $province,
                $provinces,
                "Kota {$city} menunjuk provinsi tidak dikenal: {$province}."
            );
        }
    }

    public function test_titik_tengah_provinsi_ada_di_dalam_kotak_batasnya(): void
    {
        foreach (config('daerah.province_bounds') as $province => $bounds) {
            [$latMin, $lngMin, $latMax, $lngMax] = $bounds;
            [$lat, $lng] = config('daerah.province_coordinates')[$province];

            $this->assertTrue(
                $lat >= $latMin && $lat <= $latMax && $lng >= $lngMin && $lng <= $lngMax,
                "Titik tengah {$province} berada di luar kotak batasnya sendiri."
            );
        }
    }

    public function test_kota_dapat_dipakai_pada_pemaksaan_provinsi(): void
    {
        config(['daerah.debug.enabled' => true]);

        $this->get('/?daerah=Bandung');

        $payload = $this->resolver()->forUser(null);

        $this->assertSame('Jawa Barat', $payload['province']);
        $this->assertSame('sunda', $payload['language']);
    }

    public function test_nama_bahasa_dapat_dipakai_pada_pemaksaan(): void
    {
        // Saat memeriksa "apakah bahasa Betawi sudah tampil", yang terpikir
        // adalah nama bahasanya — bukan provinsi mana yang memakainya.
        config(['daerah.debug.enabled' => true]);

        $this->get('/?daerah=betawi');

        $payload = $this->resolver()->forUser(null);

        $this->assertSame('betawi', $payload['language']);
        $this->assertSame('forced', $payload['source']);
        $this->assertSame('Mantepin Langkah Lu!', $payload['phrases']['home_hero']);
    }

    public function test_pemaksaan_nama_bahasa_tidak_peduli_huruf_besar_kecil(): void
    {
        config(['daerah.debug.enabled' => true]);

        $this->get('/?daerah=BUGIS');

        $this->assertSame('bugis', $this->resolver()->forUser(null)['language']);
    }

    public function test_pemaksaan_lewat_env_juga_menerima_nama_bahasa(): void
    {
        config([
            'daerah.debug.enabled' => true,
            'daerah.debug.force_province' => 'sunda',
        ]);

        $this->assertSame('sunda', $this->resolver()->forUser(null)['language']);
    }

    public function test_provinsi_dapat_dipaksa_lewat_query_untuk_pengujian(): void
    {
        config(['daerah.debug.enabled' => true]);

        $this->get('/?daerah=Bali');

        $payload = $this->resolver()->forUser(null);

        $this->assertSame('Bali', $payload['province']);
        $this->assertSame('forced', $payload['source']);
    }

    public function test_nama_provinsi_salah_ketik_diabaikan(): void
    {
        config(['daerah.debug.enabled' => true]);

        $this->get('/?daerah=Baliii');

        $this->assertSame('indonesia', $this->resolver()->forUser(null)['language']);
    }

    public function test_pemaksaan_provinsi_mati_di_production(): void
    {
        // Penting: tanpa ini pengunjung bisa memaksa sapaan lewat query string.
        config(['daerah.debug.enabled' => false]);

        $this->get('/?daerah=Bali');

        $payload = $this->resolver()->forUser(null);

        $this->assertNull($payload['province']);
        $this->assertSame('indonesia', $payload['language']);
    }
}
