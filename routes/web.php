<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
// use App\Http\Controllers\PlaceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\AdminNewsController;
use App\Models\News;
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

// Admin CRUD for News
Route::middleware(['auth', 'admin'])->prefix('/admin/wawasan-wisata')->name('admin.news.')->group(function () {
    Route::get('/', [AdminNewsController::class, 'index'])->name('index');
    Route::get('/create', [AdminNewsController::class, 'create'])->name('create');
    Route::post('/', [AdminNewsController::class, 'store'])->name('store');
    Route::get('/{id}/edit', [AdminNewsController::class, 'edit'])->name('edit');
    Route::post('/{id}', [AdminNewsController::class, 'update'])->name('update');
    Route::delete('/{id}', [AdminNewsController::class, 'destroy'])->name('destroy');
});

// Route::middleware('guest')->group(function () {
//     Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
// });
