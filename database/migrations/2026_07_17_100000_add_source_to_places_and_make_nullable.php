<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menyatukan sumber data tempat ke dalam satu tabel `places`:
     *  - `source` = 'internal' (ditambahkan admin NuraLoka) atau 'osm' (impor Overpass).
     *  - `description` & `address` dibuat nullable karena data OSM sering tidak
     *    memilikinya → diisi null saat impor (bukan digagalkan).
     *
     * Atribut `source` bersifat internal (admin-only); tidak ditampilkan di sisi user.
     */
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->enum('source', ['internal', 'osm'])
                ->default('internal')
                ->after('slug')
                ->index();
        });

        // Longgarkan kolom yang tidak selalu tersedia pada data OSM.
        Schema::table('places', function (Blueprint $table) {
            $table->text('description')->nullable()->change();
            $table->string('address')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn('source');
        });

        Schema::table('places', function (Blueprint $table) {
            $table->text('description')->nullable(false)->change();
            $table->string('address')->nullable(false)->change();
        });
    }
};
