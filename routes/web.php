<?php

use App\Http\Controllers\AdminNewsController;
use App\Http\Controllers\Auth\ForgetPasswordController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\LandingPageController;
// use App\Http\Controllers\PlaceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PlaceController;
use App\Models\News;
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
Route::prefix('/')->name('landing-page.')->controller(LandingPageController::class)->group(function(){
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
        Route::controller(ForgetPasswordController::class)->group(function(){
            Route::prefix('/forget-password')->name('forget-password.')->group(function(){
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

        return inertia('Admin/Dashboard', [
            'stats' => [
                'totalNews' => $totalNews,
                'totalUsers' => $totalUsers,
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
