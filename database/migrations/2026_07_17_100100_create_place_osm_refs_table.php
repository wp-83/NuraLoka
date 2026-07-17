<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Referensi asal OSM untuk baris `places` bersumber 'osm'.
     *
     * Dipisah dari tabel `places` agar `places` tetap bersih (tidak memikul
     * identitas eksternal). Relasi 1-1 (place_id unik). `osm_id` unik menjaga
     * impor tetap idempotent: re-impor node OSM yang sama memperbarui place,
     * bukan menduplikasi. `subtype` menyimpan metadata OSM mentah (amenity/
     * tourism/natural/...) yang tidak punya kolom di `places`.
     */
    public function up(): void
    {
        Schema::create('place_osm_refs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('osm_id')->unique();
            $table->string('subtype')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('place_osm_refs');
    }
};
