<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('osm_import_runs', function (Blueprint $table) {
            // Id batch (Bus::batch) dari kumpulan job per-petak yang menjalankan impor ini.
            $table->string('batch_id')->nullable()->after('sleep');
            // Jumlah petak yang sudah selesai diproses (sukses + gagal) — untuk progress bar.
            $table->unsignedInteger('processed_tiles')->default(0)->after('total_tiles');
        });
    }

    public function down(): void
    {
        Schema::table('osm_import_runs', function (Blueprint $table) {
            $table->dropColumn(['batch_id', 'processed_tiles']);
        });
    }
};
