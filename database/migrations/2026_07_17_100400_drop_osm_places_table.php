<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel `osm_places` dihapus: data POI OSM kini disimpan langsung di `places`
     * (source='osm') dengan referensi asal di `place_osm_refs`. Peta sisi user
     * membaca dari satu sumber (`places`) saja.
     */
    public function up(): void
    {
        Schema::dropIfExists('osm_places');
    }

    public function down(): void
    {
        Schema::create('osm_places', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('osm_id')->unique();
            $table->string('name');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('address')->nullable();
            $table->string('category')->nullable();
            $table->string('subtype')->nullable();
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
            $table->index('category');
        });
    }
};
