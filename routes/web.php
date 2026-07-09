<?php

use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminNewsController;
use App\Http\Controllers\AdminPlaceController;
use App\Http\Controllers\Auth\ForgetPasswordController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PlaceController;
use App\Models\Category;
use App\Models\News;
use App\Models\Place;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $latestNews = News::with('user.userDetails')
        ->orderBy('publish_date', 'desc')
        ->take(3)
        ->get();

    return inertia('Home', [
        'latestNews' => $latestNews,
    ]);
})->name('/')->middleware('auth');

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

        // google auth
        Route::controller(GoogleController::class)->prefix('google')->name('google.')->group(function () {
            Route::get('/login', 'redirectLogin')->name('login');
            Route::get('/register', 'redirectRegister')->name('register');
            Route::get('/callback', 'callback')->name('callback');
        });

        // forget password
        Route::controller(ForgetPasswordController::class)->prefix('forget-password')->name('forget-password.')->group(function () {});
    });

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');
});

// Explore
Route::prefix('/jelajah')->name('explore.')->controller(ExploreController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/track', 'trackVisit')->name('track');
});

// Logout
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');

Route::middleware('guest')->group(function () {
    Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
});

// Detail Place
Route::get('/places/{slug}', [PlaceController::class, 'show'])->name('places.show');
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
                'totalNews'       => $totalNews,
                'totalUsers'      => $totalUsers,
                'totalPlaces'     => $totalPlaces,
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
