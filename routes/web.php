<?php

use App\Http\Controllers\AdminBadgeController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminLevelController;
use App\Http\Controllers\AdminMissionController;
use App\Http\Controllers\AdminNewsController;
use App\Http\Controllers\AdminOsmImportController;
use App\Http\Controllers\AdminPlaceController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\Auth\ForgetPasswordController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

// Ganti bahasa (id/en/ko) — dapat diakses semua pengunjung (tamu & login).
Route::get('/bahasa/{locale}', [LocaleController::class, 'switch'])->name('locale.switch');

// Landing Page
Route::prefix('/')->name('landing-page.')->controller(LandingPageController::class)->group(function () {
    Route::get('/', 'index')->name('index');
});

// Authentication
Route::prefix('/auth')->name('auth.')->group(function () {
    Route::middleware('guest')->group(function () {
        // Login
        Route::prefix('/login')->name('login.')->controller(LoginController::class)->group(function () {
            Route::get('/', 'show')->name('index');
            Route::post('/', 'login')->name('authenticate');
        });

        // register
        Route::controller(RegisterController::class)->prefix('/register')->name('register.')->group(function () {
            Route::get('/', 'show')->name('index');
            Route::post('register', 'store')->name('store');

            Route::get('/detail-account', 'detail')->name('detail');
            Route::post('/detail-account', 'saveAccountDetail')->name('store.detail');
        });

        // Forget Password
        Route::controller(ForgetPasswordController::class)->group(function () {
            Route::prefix('/forget-password')->name('forget-password.')->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'send')->name('send');
                Route::get('/success', 'sendSuccess')->name('success');
            });

            Route::prefix('/reset-password')->name('reset-password.')->group(function () {
                Route::get('/{token}', 'resetPass')->name('index');
                Route::post('/', 'update')->name('update');
            });
        });

        // google auth
        Route::controller(GoogleController::class)->prefix('google')->name('google.')->group(function () {
            Route::get('/login', 'redirectLogin')->name('login');
            Route::get('/register', 'redirectRegister')->name('register');
            Route::get('/callback', 'callback')->name('callback');
        });
    });

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');
});

// User Features
Route::middleware(['auth', 'unbanned'])->group(function () {
    // Home
    Route::prefix('/beranda')->name('home.')->controller(HomeController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Profile
    Route::prefix('/profil')->name('profile.')->controller(ProfileController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/ubah', 'edit')->name('edit');
        Route::put('/', 'update')->name('update');
        Route::get('/{username}', 'show')->name('show');
    });

    // Explore
    Route::prefix('/jelajah')->name('explore.')->controller(ExploreController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/titik', 'points')->name('points');   // API peta — sebelum /{slug} agar tidak tertangkap
        Route::get('/cari', 'search')->name('search');     // autocomplete pencarian (admin + OSM)
        Route::get('/trending', 'trending')->name('trending'); // Ramai dikunjungi sekitar user (radius lokasi)
        Route::post('/lacak', 'trackVisit')->name('track');
        Route::post('/checkin', 'checkIn')->name('checkin'); // check-in kunjungan (verifikasi lokasi)
        Route::get('/rute-titik', 'routeWaypoints')->name('route-waypoints'); // via-point admin rute 2 titik
        Route::post('/rute-osm', 'routeOsmWaypoints')->name('route-osm'); // fallback OSM di-snap ke rute nyata
        Route::post('/perjalanan', 'startJourney')->name('journey'); // mulai/selesaikan perjalanan 2 titik
        Route::get('/{slug}', 'show')->name('show');
    });

    // Challenges
    Route::prefix('/tantangan')->name('challenge.')->controller(ChallengeController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/lencana', 'badges')->name('badges');
        Route::get('/papan-peringkat', 'leaderboard')->name('leaderboard');
        Route::get('/level', 'levels')->name('levels');
    });

    // Wishlist
    Route::prefix('/impian')->name('wishlist.')->controller(WishlistController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/toggle', 'toggle')->name('toggle');
        Route::get('/{slug}', 'show')->name('show');
    });

    // Album
    Route::prefix('/album')->name('album.')->controller(AlbumController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/lokasi/cari', 'searchLocation')->name('location.search');
        Route::get('/buat', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/semua', 'allAlbums')->name('all');
        Route::get('/pengguna/{userId}', 'userAlbums')->name('user.albums');
        Route::get('/{album:slug}', 'show')->name('show');
        Route::get('/{album:slug}/ubah', 'edit')->name('edit');
        Route::put('/{album:slug}', 'update')->name('update');
        Route::delete('/{album:slug}/hapus', 'destroy')->name('destroy');
        Route::post('/{album:slug}/visibilitas', 'toggleVisibility')->name('toggle.visibility');
        Route::post('/{album:slug}/foto', 'addPhoto')->name('photo.add');
        Route::delete('/foto/{photoId}/hapus', 'removePhoto')->name('photo.remove');
    });

    // News
    Route::controller(NewsController::class)->prefix('/wawasan-wisata')->name('news.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
    });
});

// Admin Features
Route::middleware(['auth', 'unbanned', 'admin'])->prefix('/admin')->name('admin.')->group(function () {
    // Dashboard
    Route::prefix('/dasbor')->name('dashboard.')->controller(DashboardController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Place Management
    Route::prefix('/places')->name('places.')->group(function () {
        Route::get('/', [AdminPlaceController::class, 'index'])->name('index');
        Route::get('/create', [AdminPlaceController::class, 'create'])->name('create');
        Route::post('/', [AdminPlaceController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminPlaceController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminPlaceController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminPlaceController::class, 'destroy'])->name('destroy');
    });

    // OSM Import (impor data titik OSM dinamis dari panel admin)
    Route::prefix('/impor-osm')->name('osm-import.')->controller(AdminOsmImportController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/status', 'status')->name('status');
        Route::post('/', 'store')->name('store');
    });

    // Category Management
    Route::prefix('/categories')->name('categories.')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index'])->name('index');
        Route::get('/create', [AdminCategoryController::class, 'create'])->name('create');
        Route::post('/', [AdminCategoryController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminCategoryController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCategoryController::class, 'destroy'])->name('destroy');
    });

    // Mission Management
    Route::prefix('/tantangan')->name('missions.')->group(function () {
        Route::get('/', [AdminMissionController::class, 'index'])->name('index');
        Route::get('/create', [AdminMissionController::class, 'create'])->name('create');
        Route::post('/', [AdminMissionController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminMissionController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminMissionController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminMissionController::class, 'destroy'])->name('destroy');
    });

    // Badge Management
    Route::prefix('/lencana')->name('badges.')->group(function () {
        Route::get('/', [AdminBadgeController::class, 'index'])->name('index');
        Route::get('/create', [AdminBadgeController::class, 'create'])->name('create');
        Route::post('/', [AdminBadgeController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminBadgeController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminBadgeController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminBadgeController::class, 'destroy'])->name('destroy');
    });

    // Level Management
    Route::prefix('/level')->name('levels.')->group(function () {
        Route::get('/', [AdminLevelController::class, 'index'])->name('index');
        Route::get('/create', [AdminLevelController::class, 'create'])->name('create');
        Route::post('/', [AdminLevelController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminLevelController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminLevelController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminLevelController::class, 'destroy'])->name('destroy');
    });

    // News Management
    Route::prefix('/wawasan-wisata')->name('news.')->group(function () {
        Route::get('/', [AdminNewsController::class, 'index'])->name('index');
        Route::get('/create', [AdminNewsController::class, 'create'])->name('create');
        Route::post('/', [AdminNewsController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminNewsController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminNewsController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminNewsController::class, 'destroy'])->name('destroy');
    });

    // User Management
    Route::prefix('/pengguna')->name('users.')->controller(UserController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/tambah', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{user}/ubah', 'edit')->name('edit');
        Route::put('/{user}', 'update')->name('update');
        Route::patch('/{user}/blokir', 'ban')->name('ban');
        Route::patch('/{user}/buka-blokir', 'unban')->name('unban');
        Route::delete('/{user}', 'destroy')->name('destroy');
    });

    // Language Management

});
