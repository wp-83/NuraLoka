<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check-in visits: one unique row per (user, place), used for the
     * "most visited" ranking.
     */
    public function up(): void
    {
        Schema::create('place_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('place_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('latitude', 10, 7)->nullable(); // user's location at check-in
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'place_id']); // one visit per user/place
            $table->index('place_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('place_visits');
    }
};
