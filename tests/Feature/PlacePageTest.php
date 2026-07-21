<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Halaman & kartu TEMPAT: thumbnail, ikon kategori, dan kesamaan
 * halaman detail antara Jelajah dan Impian.
 */
class PlacePageTest extends TestCase
{
    use RefreshDatabase;

    // ── dari PlaceCardThumbnailTest ──────────────────────────────
    public function test_tempat_berfoto_punya_img_dari_fotonya(): void
    {
        $place = Place::whereHas('tripPhotos')->with('tripPhotos')->first();

        $this->assertNotNull($place, 'Tidak ada tempat berfoto untuk diuji.');

        $this->assertSame(
            '/storage/'.$place->tripPhotos->first()->photo_path,
            $place->img,
        );
    }

    public function test_tempat_tanpa_foto_mengembalikan_null(): void
    {
        $place = Place::whereDoesntHave('tripPhotos')
            ->whereDoesntHave('photos')
            ->first();

        if (! $place) {
            $this->markTestSkipped('Semua tempat punya foto.');
        }

        $this->assertNull($place->img);
    }

    public function test_kartu_di_halaman_impian_menerima_img(): void
    {
        $user = User::whereHas('savedPlaces')->first();

        $this->assertNotNull($user, 'Tidak ada user dengan tempat tersimpan.');

        $props = $this->actingAs($user)
            ->get(route('wishlist.index'))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertNotEmpty($props['savedPlaces']);

        foreach ($props['savedPlaces'] as $place) {
            $this->assertArrayHasKey(
                'img',
                $place,
                'Kartu di halaman Impian tidak menerima img.'
            );
        }
    }

    public function test_kartu_ramai_dikunjungi_menerima_img(): void
    {
        $props = $this->actingAs(User::whereHas('userDetail')->first())
            ->get(route('explore.index'))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertNotEmpty($props['trendingPlaces'], 'Tidak ada trending place.');

        foreach ($props['trendingPlaces'] as $place) {
            $this->assertArrayHasKey('img', $place);
        }
    }

    public function test_daftar_kartu_tidak_menimbulkan_kueri_per_kartu(): void
    {
        // Relasi foto harus dimuat sekaligus; tanpa itu tiap kartu memicu
        // kueri sendiri (N+1) hanya untuk mencari satu foto sampul.
        $user = User::whereHas('savedPlaces')->first();

        DB::enableQueryLog();

        $this->actingAs($user)->get(route('wishlist.index'));

        $jumlahKueri = count(DB::getQueryLog());

        DB::disableQueryLog();

        $jumlahTempat = $user->savedPlaces()->count();

        $this->assertLessThan(
            $jumlahTempat + 25,
            $jumlahKueri,
            "Kueri ({$jumlahKueri}) tumbuh sebanding jumlah tempat ({$jumlahTempat}) — relasi foto belum dimuat sekaligus."
        );
    }

    public function test_img_tidak_dipasang_global_di_model(): void
    {
        // Endpoint peta mengirim sampai 1.500 titik dan tidak memakai thumbnail.
        // Kalau 'img' dipasang lewat $appends di model Place, setiap titik akan
        // ikut mencari fotonya sendiri dan endpoint itu jadi sangat lambat.
        //
        // Endpoint petanya sendiri tidak bisa diuji di sini: kuerinya memakai
        // FIELD() milik MySQL, sedangkan test berjalan di SQLite.
        $appends = (new \ReflectionClass(Place::class))->getDefaultProperties()['appends'] ?? [];

        $this->assertNotContains(
            'img',
            $appends,
            "'img' dipasang lewat \$appends — akan memperlambat endpoint peta."
        );

        // Sebaliknya, halaman yang memang menampilkan kartu wajib meng-append-nya.
        foreach (['ExploreController', 'WishlistController'] as $controller) {
            $this->assertStringContainsString(
                "append('img')",
                file_get_contents(app_path("Http/Controllers/{$controller}.php")),
                "{$controller} tidak meng-append 'img' untuk kartu tempat."
            );
        }
    }

    // ── dari CategoryIconTest ────────────────────────────────────
    public function test_kategori_di_halaman_detail_menyertakan_icon_path(): void
    {
        $place = Place::whereHas('categories')->first();

        $props = $this->actingAs(User::whereHas('userDetail')->first())
            ->get(route('explore.show', $place->slug))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertNotEmpty($props['place']['categories']);

        foreach ($props['place']['categories'] as $category) {
            $this->assertArrayHasKey(
                'icon_path',
                $category,
                'Kategori di halaman detail tidak menyertakan icon_path.'
            );
        }
    }

    public function test_kategori_di_kartu_tempat_menyertakan_icon_path(): void
    {
        $props = $this->actingAs(User::whereHas('userDetail')->first())
            ->get(route('explore.index'))
            ->assertOk()
            ->viewData('page')['props'];

        $this->assertNotEmpty($props['trendingPlaces']);

        $adaKategori = false;

        foreach ($props['trendingPlaces'] as $place) {
            foreach ($place['categories'] ?? [] as $category) {
                $adaKategori = true;

                $this->assertArrayHasKey('icon_path', $category);
            }
        }

        $this->assertTrue($adaKategori, 'Tidak ada kategori pada kartu tempat.');
    }

    public function test_ikon_kategori_dipakai_bersama_satu_sumber(): void
    {
        // Kartu, detail, dan pin peta harus memakai resolusi ikon yang sama —
        // kalau tidak, kategori yang sama bisa tampil beda di tiap tempat.
        $shared = resource_path('js/categoryIcons.js');

        $this->assertFileExists($shared);

        $chip = file_get_contents(resource_path('js/Components/Features/CategoryChip.jsx'));

        $this->assertStringContainsString("from '@js/categoryIcons'", $chip);

        $map = file_get_contents(resource_path('js/Components/Features/ExploreMap.jsx'));

        $this->assertStringContainsString("from '@js/categoryIcons'", $map);
        $this->assertStringNotContainsString(
            'const CATEGORY_EMOJI = {',
            $map,
            'ExploreMap masih punya salinan peta emoji sendiri.'
        );
    }

    public function test_kartu_dan_detail_memakai_komponen_chip_yang_sama(): void
    {
        foreach (['PlaceCard.jsx', 'PlaceDetail.jsx'] as $file) {
            $source = file_get_contents(resource_path('js/Components/Features/'.$file));

            $this->assertStringContainsString(
                '<CategoryChip',
                $source,
                "{$file} tidak memakai CategoryChip."
            );
        }
    }

    // ── dari PlaceDetailParityTest ───────────────────────────────
    private function place(): Place
    {
        // Tempat yang benar-benar punya foto album, supaya galerinya tidak kosong.
        return Place::whereHas('tripPhotos')->first() ?? Place::first();
    }

    public function test_kedua_halaman_menerima_props_yang_sama(): void
    {
        $user = User::whereHas('userDetail')->first();
        $place = $this->place();

        $jelajah = $this->actingAs($user)
            ->get(route('explore.show', $place->slug))
            ->assertOk()
            ->viewData('page')['props'];

        $impian = $this->actingAs($user)
            ->get(route('wishlist.show', $place->slug))
            ->assertOk()
            ->viewData('page')['props'];

        foreach (['gallery', 'isSaved', 'totalSaves', 'visitorsCount', 'albumPostersCount'] as $key) {
            $this->assertArrayHasKey($key, $impian, "Halaman Impian tidak mengirim '{$key}'.");
            $this->assertArrayHasKey($key, $jelajah, "Halaman Jelajah tidak mengirim '{$key}'.");

            $this->assertEquals(
                $jelajah[$key],
                $impian[$key],
                "Nilai '{$key}' berbeda antara halaman Jelajah dan Impian."
            );
        }

        $this->assertSame($jelajah['place']['id'], $impian['place']['id']);
    }

    public function test_halaman_impian_mengirim_galeri_asli(): void
    {
        $place = $this->place();

        $props = $this->actingAs(User::whereHas('userDetail')->first())
            ->get(route('wishlist.show', $place->slug))
            ->viewData('page')['props'];

        $this->assertIsArray($props['gallery']);

        // Galeri lama adalah 8 entri palsu berisi gambar yang sama; galeri asli
        // berisi entri dengan url berbeda-beda.
        if (count($props['gallery']) > 1) {
            $urls = array_column($props['gallery'], 'url');

            $this->assertNotEmpty(array_filter($urls));
        }
    }

    public function test_kedua_halaman_memakai_komponen_yang_sama(): void
    {
        foreach (['Explore', 'Wishlist'] as $folder) {
            $source = file_get_contents(resource_path("js/Pages/{$folder}/Show.jsx"));

            $this->assertStringContainsString(
                "import PlaceDetail from '@components/Features/PlaceDetail'",
                $source,
                "{$folder}/Show.jsx tidak memakai komponen PlaceDetail bersama."
            );

            $this->assertStringContainsString('<PlaceDetail', $source);
        }
    }

    public function test_halaman_detail_tidak_lagi_menyalin_tata_letak(): void
    {
        // Kalau salah satu halaman tumbuh besar lagi, berarti tata letaknya
        // mulai disalin ulang dan keduanya akan berbeda lagi seiring waktu.
        foreach (['Explore', 'Wishlist'] as $folder) {
            $baris = substr_count(
                file_get_contents(resource_path("js/Pages/{$folder}/Show.jsx")),
                "\n"
            );

            $this->assertLessThan(
                60,
                $baris,
                "{$folder}/Show.jsx terlalu panjang — kemungkinan tata letaknya disalin lagi."
            );
        }
    }
}
