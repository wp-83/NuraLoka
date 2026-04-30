<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return inertia('Home', [
        'title' => 'Hello Inertia React',
    ]);
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);
});

Route::get('/test-404', function () {
    abort(404);
});

Route::get('/lint', function () {
    return Inertia::render('Test');
});

/**
 * Google Authentication Routes
 */
Route::prefix('auth')->group(function () {
    Route::get('/google', [GoogleController::class, 'redirect'])->name('google.login');
    Route::get('/google/callback', [GoogleController::class, 'callback']);
});
