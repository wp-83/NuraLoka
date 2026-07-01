<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
// use App\Http\Controllers\PlaceController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\NewsController;

Route::get('/', function () {
    $latestNews = \App\Models\News::with('user.userDetails')
        ->orderBy('publish_date', 'desc')
        ->take(3)
        ->get();
    return inertia('Home', [
        'latestNews' => $latestNews,
    ]);
})->name('/')->middleware('auth');

Route::get('/login', function () {
    return redirect(route('auth.login.index'));
})->name('login');

Route::prefix('/auth')->name('auth.')->middleware('guest')->group(function () {
    // Login
    Route::prefix('/login')->name('login.')->middleware('guest')->controller(LoginController::class)->group(function () {
        Route::get('/', 'show')->name('index');
        Route::post('/', 'login')->name('authenticate');
    });

    // register
    Route::controller(RegisterController::class)->prefix('/register')->name('register.')->middleware('guest')->group(function () {
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
});

// Logout
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');

// News (Wawasan Wisata)
Route::middleware('auth')->group(function () {
    Route::controller(NewsController::class)->prefix('/wawasan-wisata')->name('news.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
    });
});

// Route::middleware('guest')->group(function () {
//     Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
// });
