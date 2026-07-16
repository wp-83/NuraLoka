<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah FULLTEXT index pada kolom `name` di `osm_places` & `places` agar pencarian
 * autocomplete (endpoint /jelajah/cari) tetap cepat saat data OSM membesar.
 * LIKE '%q%' tidak memakai index; FULLTEXT (MATCH ... AGAINST) memakainya.
 *
 * FULLTEXT hanya didukung MySQL/MariaDB, jadi di-guard per driver agar aman untuk
 * lingkungan lain (mis. SQLite saat testing).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('osm_places', function (Blueprint $table) {
            $table->fullText('name', 'osm_places_name_fulltext');
        });

        Schema::table('places', function (Blueprint $table) {
            $table->fullText('name', 'places_name_fulltext');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('osm_places', function (Blueprint $table) {
            $table->dropFullText('osm_places_name_fulltext');
        });

        Schema::table('places', function (Blueprint $table) {
            $table->dropFullText('places_name_fulltext');
        });
    }
};
