<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * OSM origin reference for `places` rows with source='osm'. Kept separate
     * so `places` stays free of external identifiers. One-to-one via unique
     * `place_id`; unique `osm_id` keeps re-imports idempotent (update, not
     * duplicate). `subtype` holds raw OSM metadata with no column in `places`.
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
