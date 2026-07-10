<?php

use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminNewsController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\AdminPlaceController;
use App\Http\Controllers\Auth\ForgetPasswordController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\LandingPageController;
// use App\Http\Controllers\PlaceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PlaceController;
use App\Models\Category;
use App\Models\News;
use App\Models\Place;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/home', function () {
    $latestNews = News::with('user.userDetails')
        ->orderBy('publish_date', 'desc')
        ->take(3)
        ->get();

    return inertia('Home', [
        'latestNews' => $latestNews,
    ]);
})->name('home')->middleware('auth');

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

// Explore
Route::prefix('/jelajah')->name('explore.')->controller(ExploreController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/track', 'trackVisit')->name('track');
});

Route::middleware('guest')->group(function () {
    Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
});

// Detail Place
Route::get('/places/{slug}', [PlaceController::class, 'show'])->name('places.show');

// Wishlist (Impian)
Route::middleware('auth')->prefix('/impian')->name('wishlist.')->controller(WishlistController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/toggle', 'toggle')->name('toggle');
    Route::get('/{slug}', 'show')->name('show');
});
// News (Wawasan Wisata)
Route::middleware('auth')->group(function () {
    Route::controller(NewsController::class)->prefix('/wawasan-wisata')->name('news.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
    });
});

// Admin Management Portal
Route::middleware(['auth', 'admin'])->prefix('/admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $totalNews = News::count();
        $totalUsers = User::count();
        $totalPlaces = Place::count();
        $totalCategories = Category::count();

        return inertia('Admin/Dashboard', [
            'stats' => [
                'totalNews' => $totalNews,
                'totalUsers' => $totalUsers,
                'totalPlaces' => $totalPlaces,
                'totalCategories' => $totalCategories,
            ],
        ]);
    })->name('dashboard');

    Route::prefix('/wawasan-wisata')->name('news.')->group(function () {
        Route::get('/', [AdminNewsController::class, 'index'])->name('index');
        Route::get('/create', [AdminNewsController::class, 'create'])->name('create');
        Route::post('/', [AdminNewsController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminNewsController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminNewsController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminNewsController::class, 'destroy'])->name('destroy');
    });
});

// Route::middleware('guest')->group(function () {
//     Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
// });

// Album
Route::middleware('auth')->prefix('/album')->name('album.')->controller(AlbumController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/semua', 'allAlbums')->name('all');
    Route::get('/user/{userId}', 'userAlbums')->name('user.albums');
    Route::get('/{id}', 'show')->name('show');
    Route::get('/{id}/edit', 'edit')->name('edit');
    Route::put('/{id}', 'update')->name('update');
    Route::delete('/{id}', 'destroy')->name('destroy');
    Route::post('/{id}/toggle-visibility', 'toggleVisibility')->name('toggle.visibility');
    Route::post('/{id}/photo', 'addPhoto')->name('photo.add');
    Route::delete('/photo/{photoId}', 'removePhoto')->name('photo.remove');
    // Admin Place Management
    Route::prefix('/places')->name('places.')->group(function () {
        Route::get('/', [AdminPlaceController::class, 'index'])->name('index');
        Route::get('/create', [AdminPlaceController::class, 'create'])->name('create');
        Route::post('/', [AdminPlaceController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminPlaceController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminPlaceController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminPlaceController::class, 'destroy'])->name('destroy');
    });

    // Admin Category Management
    Route::prefix('/categories')->name('categories.')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index'])->name('index');
        Route::get('/create', [AdminCategoryController::class, 'create'])->name('create');
        Route::post('/', [AdminCategoryController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminCategoryController::class, 'edit'])->name('edit');
        Route::post('/{id}', [AdminCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCategoryController::class, 'destroy'])->name('destroy');
    });
});
