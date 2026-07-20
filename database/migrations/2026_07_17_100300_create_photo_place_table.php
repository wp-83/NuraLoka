<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot linking `photos` to `places`; the combination stays unique.
     */
    public function up(): void
    {
        Schema::create('photo_place', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('place_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['photo_id', 'place_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_place');
    }
};
