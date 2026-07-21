<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();

            // 'internal' = added by an admin, 'osm' = imported from Overpass. Admin-only, not shown to users.
            $table->enum('source', ['internal', 'osm'])->default('internal')->index();

            // Nullable: OSM imports often lack these, so leave null instead of failing.
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->integer('min_price')->nullable();
            $table->integer('max_price')->nullable();
            $table->timestamps();
        });

        // FULLTEXT keeps autocomplete search fast at scale (LIKE '%q%' can't use an index).
        // MySQL/MariaDB only, so guard by driver (e.g. SQLite in tests).
        if (DB::getDriverName() === 'mysql') {
            Schema::table('places', function (Blueprint $table) {
                $table->fullText('name', 'places_name_fulltext');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
