<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel POI hasil impor dari Overpass (OSM) ke DB sendiri, agar peta bisa
     * menampilkan banyak titik sekaligus tanpa rate-limit API publik.
     */
    public function up(): void
    {
        Schema::create('osm_places', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('osm_id')->unique(); // id node OSM → impor idempotent
            $table->string('name');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('address')->nullable();
            $table->string('category')->nullable();  // kategori NuraLoka (Kuliner, Museum, ...)
            $table->string('subtype')->nullable();
            $table->timestamps();

            // Index untuk query bounding-box & filter kategori
            $table->index(['latitude', 'longitude']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('osm_places');
    }
};
