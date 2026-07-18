<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Menandai trip/album yang dibuat OTOMATIS oleh sistem (perjalanan 2 titik).
     * Album sistem: judul/lokasi/tanggal tidak boleh diubah user — hanya foto.
     */
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};
