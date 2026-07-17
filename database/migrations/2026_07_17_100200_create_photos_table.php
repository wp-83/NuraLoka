<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel media terpusat. Untuk sekarang hanya dihubungkan ke `places`
     * (lewat pivot `photo_place`). Ke depan, seluruh entitas yang punya foto
     * direncanakan berelasi ke tabel ini juga (via pivot masing-masing) agar
     * penyimpanan media ternormalisasi di satu tempat.
     */
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->string('path'); // relatif terhadap disk 'public' (dirender via /storage/{path})
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
