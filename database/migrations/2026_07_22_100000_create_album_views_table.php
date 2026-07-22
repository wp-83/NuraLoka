<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per album view, used for the "popular this week" ranking.
     *
     * albums.view_count only stores a lifetime total, so it cannot answer
     * "which albums were watched THIS week". This log keeps the timestamp of
     * every view so the ranking really is weekly.
     */
    public function up(): void
    {
        Schema::create('album_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnUpdate()->nullOnDelete();
            $table->timestamp('viewed_at');
            $table->timestamps();

            // The weekly ranking filters by date and groups by album.
            $table->index(['album_id', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('album_views');
    }
};
