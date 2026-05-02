<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('auth/login');
});

Route::prefix('/auth')->name('auth.')->middleware('guest')->group(function () {
    // Login
    Route::get('/login', [LoginController::class, 'show'])
        ->name('login')
        ->middleware('guest');

    Route::post('/login', [LoginController::class, 'store'])
        ->middleware('guest');

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy'])
        ->name('logout')
        ->middleware('auth');

    // register
    Route::controller(RegisterController::class)->prefix('/register')->name('register.')->group(function () {
        Route::get('/', 'register')->name('index');
        Route::post('register', 'store');
    });

    // google auth
    Route::controller(GoogleController::class)->prefix('google')->name('google.')->group(function () {
        Route::get('/', 'redirect')->name('google.login');
        Route::get('/callback', 'callback');
    });
});
