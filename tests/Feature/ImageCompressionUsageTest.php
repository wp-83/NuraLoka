<?php

namespace Tests\Feature;

use App\Http\Controllers\AdminBadgeController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminNewsController;
use App\Http\Controllers\AdminPlaceController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\Level;
use App\Models\TripPhoto;
use App\Models\User;
use App\Models\UserDetail;
use App\Services\ImageCompressionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ReflectionClass;
use Tests\TestCase;

/**
 * Setiap controller yang menerima unggahan gambar wajib memakai
 * ImageCompressionService — dan menerimanya lewat constructor, bukan
 * app(ImageCompressionService::class) di tengah-tengah method.
 */
class ImageCompressionUsageTest extends TestCase
{
    use RefreshDatabase;

    /** Controller yang memang menangani unggahan gambar. */
    private const UPLOAD_CONTROLLERS = [
        AlbumController::class,
        ProfileController::class,
        UserController::class,
        AdminPlaceController::class,
        AdminNewsController::class,
        AdminCategoryController::class,
        AdminBadgeController::class,
    ];

    public function test_controller_unggahan_menerima_service_lewat_constructor(): void
    {
        foreach (self::UPLOAD_CONTROLLERS as $controller) {
            $constructor = (new ReflectionClass($controller))->getConstructor();

            $this->assertNotNull(
                $constructor,
                class_basename($controller).' belum punya constructor.'
            );

            $types = array_map(
                fn ($parameter) => $parameter->getType()?->getName(),
                $constructor->getParameters(),
            );

            $this->assertContains(
                ImageCompressionService::class,
                $types,
                class_basename($controller).' tidak menerima ImageCompressionService.'
            );
        }
    }

    public function test_controller_dapat_diresolve_oleh_container(): void
    {
        foreach (self::UPLOAD_CONTROLLERS as $controller) {
            $this->assertInstanceOf($controller, app($controller));
        }
    }

    public function test_tidak_ada_lagi_service_locator_untuk_gambar(): void
    {
        $offenders = [];

        foreach (glob(app_path('Http/Controllers').'/{,*/}*.php', GLOB_BRACE) as $file) {
            $source = file_get_contents($file);

            if (str_contains($source, 'app(ImageCompressionService::class)')) {
                $offenders[] = basename($file);
            }
        }

        $this->assertSame(
            [],
            $offenders,
            'Masih memakai app(ImageCompressionService::class); pakai injeksi constructor.'
        );
    }

    public function test_tidak_ada_unggahan_yang_melewati_service(): void
    {
        $offenders = [];

        foreach (glob(app_path('Http/Controllers').'/{,*/}*.php', GLOB_BRACE) as $file) {
            $source = file_get_contents($file);

            // Penyimpanan berkas langsung akan melewati kompresi & penamaan seragam.
            if (preg_match('/->store\(|->storeAs\(|putFileAs\(/', $source)) {
                $offenders[] = basename($file);
            }
        }

        $this->assertSame(
            [],
            $offenders,
            'Ada controller menyimpan berkas langsung tanpa ImageCompressionService.'
        );
    }

    public function test_unggahan_album_tetap_berjalan_lewat_service(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        UserDetail::create([
            'user_id' => $user->id,
            'province_id' => 1,
            'fullname' => 'Penguji Unggah',
            'dob' => '2000-01-01',
            'gender' => 'unspecified',
            'total_points' => 0,
            'level_id' => Level::idForPoints(0),
        ]);

        $response = $this->actingAs($user)->post(route('album.store'), [
            'title' => 'Album Uji Kompresi',
            'location' => 'Bandung',
            'date' => now()->toDateString(),
            'is_public' => true,
            'photos' => [UploadedFile::fake()->image('foto.jpg', 2400, 1600)],
        ]);

        $response->assertRedirect();

        // Harus foto milik album user INI — TripPhoto::first() akan mengambil
        // foto hasil seed yang berkasnya memang tidak ada di disk palsu.
        $photo = TripPhoto::whereHas(
            'album.trip',
            fn ($q) => $q->where('user_id', $user->id),
        )->first();

        $this->assertNotNull($photo, 'Foto tidak tersimpan.');
        $this->assertStringStartsWith('album-photos/', $photo->photo_path);
        Storage::disk('public')->assertExists($photo->photo_path);
    }
}
