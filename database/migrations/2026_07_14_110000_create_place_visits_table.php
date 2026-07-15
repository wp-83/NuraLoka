<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check-in kunjungan: 1 baris unik per (user, place). Dipakai untuk menghitung
     * jumlah pengunjung unik pada ranking "Ramai Dikunjungi".
     */
    public function up(): void
    {
        Schema::create('place_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('place_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();   // lokasi user saat check-in
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'place_id']); // 1 kunjungan unik per user/place
            $table->index('place_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('place_visits');
    }
};
