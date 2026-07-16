<?php

namespace App\Jobs;

use App\Models\OsmImportRun;
use App\Models\OsmPlace;
use App\Services\OsmImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ImportOsmPlacesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Impor bisa berjalan lama (banyak petak + jeda antar request). Beri timeout longgar
    // dan jangan retry otomatis agar tidak menjalankan impor ganda.
    public int $timeout = 7200;

    public int $tries = 1;

    public function __construct(public int $runId) {}

    public function handle(OsmImportService $service): void
    {
        $run = OsmImportRun::find($this->runId);
        if (! $run) {
            return;
        }

        $run->update([
            'status' => 'running',
            'started_at' => now(),
            'places_before' => OsmPlace::count(),
        ]);

        try {
            $result = $service->import(
                $run->south, $run->west, $run->north, $run->east,
                $run->tile, $run->sleep,
                // Update progres berkala (tiap 5 petak) agar admin bisa memantau tanpa
                // membebani DB dengan tulis di setiap petak.
                function (int $tileIndex, int $totalTiles, int $importedSoFar) use ($run) {
                    if ($tileIndex % 5 === 0 || $tileIndex === $totalTiles) {
                        $run->update([
                            'imported' => $importedSoFar,
                            'total_tiles' => $totalTiles,
                        ]);
                    }
                }
            );

            $run->update([
                'status' => 'success',
                'imported' => $result['imported'],
                'failed_tiles' => $result['failedTiles'],
                'total_tiles' => $result['totalTiles'],
                'places_after' => OsmPlace::count(),
                'finished_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $run->update([
                'status' => 'failed',
                'message' => mb_substr($e->getMessage(), 0, 1000),
                'places_after' => OsmPlace::count(),
                'finished_at' => now(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        $run = OsmImportRun::find($this->runId);
        if ($run && $run->status !== 'failed') {
            $run->update([
                'status' => 'failed',
                'message' => mb_substr($e->getMessage(), 0, 1000),
                'finished_at' => now(),
            ]);
        }
    }
}
