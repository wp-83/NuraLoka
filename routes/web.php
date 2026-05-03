<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('auth/login');
});

Route::prefix('/auth')->name('auth.')->middleware('guest')->group(function () {
    // login
    Route::controller(LoginController::class)->prefix('/login')->name('login.')->group(function () {
        Route::get('/', 'show')->name('index');
        Route::post('/', 'login')->name('authenticate');
    });

    // register
    Route::controller(RegisterController::class)->prefix('/register')->name('register.')->group(function () {
        Route::get('/', 'create')->name('index');
        Route::post('register', 'store');
    });

    // google auth
    Route::controller(GoogleController::class)->prefix('google')->name('google.')->group(function () {
        Route::get('/', 'redirect')->name('google.login');
        Route::get('/callback', 'callback');
    });
});
