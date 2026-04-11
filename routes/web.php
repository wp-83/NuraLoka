<?php

use App\Http\Controllers\MapController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Home', [
        'title' => 'Hello Inertia React',
    ]);
});

Route::get('/test-404', function () {
    abort(404);
});

Route::get("/lint", function () {
    return Inertia::render('Test');
});

/**
 * Test map hiraukan saja
 */
Route::get('/map-test', function () {
    return Inertia::render('Map/SimpleMap1');
});

Route::get('/map', [MapController::class, 'index']);

Route::post('/filter-pois', [MapController::class, 'filterByPath'])->name('pois.filter');
