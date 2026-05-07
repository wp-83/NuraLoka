<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Home');
})->name('/')->middleware('auth');

Route::get('/login', function () {
    return redirect(route('auth.login.index'));
})->name('login');

Route::prefix('/auth')->name('auth.')->group(function () {
    // Login
    Route::get('/login', [LoginController::class, 'show'])
        ->name('login')
        ->middleware('guest');

    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('guest');

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy'])
        ->name('logout')
        ->middleware('auth');

    // register
    Route::controller(RegisterController::class)->prefix('/register')->name('register.')->middleware('guest')->group(function () {
        Route::get('/', 'show')->name('index');
        Route::post('register', 'store')->name('store');

        Route::get('/detail-account', 'detail')->name('detail');
        Route::post('/detail-account', 'saveAccountDetail')->name('store.detail');
    });

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // google auth
    Route::controller(GoogleController::class)->prefix('google')->name('google.')->group(function () {
        Route::get('/', 'redirect')->name('authenticate');
        Route::get('/callback', 'callback')->name('callback');
    });
});

Route::middleware('guest')->group(function () {
    Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
});

Route::resource('users', UserController::class)->middleware('auth');
