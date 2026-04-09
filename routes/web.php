<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Home', [
        'title' => 'Hello Inertia React',
    ]);
});

Route::get('/test-404', function () {
    abort(404);
});
