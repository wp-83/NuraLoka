<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('osm_import_runs', function (Blueprint $table) {
            $table->id();
            // Region preset (e.g. "jateng") or "custom" for a manual bbox.
            $table->string('region')->nullable();
            $table->decimal('south', 10, 6);
            $table->decimal('west', 10, 6);
            $table->decimal('north', 10, 6);
            $table->decimal('east', 10, 6);
            $table->decimal('tile', 5, 2)->default(0.5);
            $table->decimal('sleep', 5, 2)->default(2);
            // Bus::batch id for this run's per-tile jobs.
            $table->string('batch_id')->nullable();
            // pending → running → success | failed
            $table->string('status')->default('pending');
            $table->unsignedInteger('imported')->default(0);
            $table->unsignedInteger('failed_tiles')->default(0);
            $table->unsignedInteger('total_tiles')->default(0);
            // Tiles processed so far (success + failed), for the progress bar.
            $table->unsignedInteger('processed_tiles')->default(0);
            $table->unsignedInteger('places_before')->nullable();
            $table->unsignedInteger('places_after')->nullable();
            $table->text('message')->nullable();
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('osm_import_runs');
    }
};
