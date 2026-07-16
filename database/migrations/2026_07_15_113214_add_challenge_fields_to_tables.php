<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->enum('type', ['general', 'special'])->default('general')->after('requirement_description');
            $table->string('category')->nullable()->after('type');
            $table->integer('points')->default(0)->after('category');
            $table->integer('tier_level')->default(0)->after('points');
            $table->integer('tier_target')->default(0)->after('tier_level');
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->integer('target')->default(1)->after('points_reward');
        });

        Schema::table('user_missions', function (Blueprint $table) {
            $table->integer('progress')->default(0)->after('mission_id');
        });
    }

    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropColumn(['type', 'category', 'points', 'tier_level', 'tier_target']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn('target');
        });

        Schema::table('user_missions', function (Blueprint $table) {
            $table->dropColumn('progress');
        });
    }
};
