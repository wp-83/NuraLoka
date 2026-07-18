<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Membuat misi bersifat DINAMIS: admin menautkan misi ke aksi user nyata.
     *  - action_type : aksi pemicu (checkin | save_place | create_album | ...).
     *                  null = misi tidak ber-progress otomatis (kompatibel mundur).
     *  - category_id : filter kategori tempat (opsional) untuk aksi berbasis tempat,
     *                  mis. "check-in di kategori Pantai". null = semua kategori.
     */
    public function up(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->string('action_type')->nullable()->after('target');
            $table->foreignId('category_id')->nullable()->after('action_type')
                ->constrained('categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn('action_type');
        });
    }
};
