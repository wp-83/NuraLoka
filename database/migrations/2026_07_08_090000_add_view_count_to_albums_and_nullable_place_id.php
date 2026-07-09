<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->unsignedInteger('view_count')->default(0)->after('caption');
        });

        Schema::table('trip_photos', function (Blueprint $table) {
            $table->foreignId('place_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->dropColumn('view_count');
        });

        Schema::table('trip_photos', function (Blueprint $table) {
            $table->foreignId('place_id')->nullable(false)->change();
        });
    }
};
