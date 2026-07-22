<?php

namespace App\Jobs;

use App\Services\OsmImportService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

/**
 * Imports ONE Overpass tile, as part of an import batch.
 *
 * Working per tile rather than as one giant job keeps each job short, which
 * makes it safe against the queue's retry_after, lets a single tile be retried
 * when Overpass rate-limits us, survives a dying worker (the remaining tiles
 * stay queued), and allows tiles to be processed in parallel.
 */
class ImportOsmTileJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // One tile is one Overpass request — short enough that the default
    // retry_after is safe.
    public int $timeout = 120;

    // Overpass rate-limits often but briefly, so retry with an increasing delay.
    public int $tries = 3;

    public array $backoff = [15, 45, 90];

    public function __construct(
        public int $runId,
        public float $south,
        public float $west,
        public float $north,
        public float $east,
        public float $sleep = 0,
    ) {}

    public function handle(OsmImportService $service): void
    {
        // The batch was cancelled (by an admin, say) — stop processing tiles.
        if ($this->batch()?->cancelled()) {
            return;
        }

        $processed = $service->importTile($this->south, $this->west, $this->north, $this->east);

        // Accumulate the run counters ATOMICALLY, so parallel workers stay correct.
        DB::table('osm_import_runs')->where('id', $this->runId)->update([
            'imported' => DB::raw('imported + '.$processed),
            'processed_tiles' => DB::raw('processed_tiles + 1'),
            'updated_at' => now(),
        ]);

        // Respect Overpass's rate limit: pause between tiles, as the synchronous
        // import does.
        if ($this->sleep > 0) {
            usleep((int) ($this->sleep * 1_000_000));
        }
    }

    /**
     * Called when this tile has failed for good (retries exhausted).
     * allowFailures() on the batch keeps one failed tile from failing the whole
     * import.
     */
    public function failed(\Throwable $e): void
    {
        DB::table('osm_import_runs')->where('id', $this->runId)->update([
            'failed_tiles' => DB::raw('failed_tiles + 1'),
            'processed_tiles' => DB::raw('processed_tiles + 1'),
            'updated_at' => now(),
        ]);
    }
}
