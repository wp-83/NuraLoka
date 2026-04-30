<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\RegisteredUserController;

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
