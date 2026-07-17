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
 * Impor SATU petak (tile) Overpass sebagai bagian dari sebuah batch impor.
 *
 * Desain per-petak (bukan satu job raksasa) membuat tiap job pendek → aman terhadap
 * retry_after antrean, bisa retry per-petak saat Overpass kena rate-limit, tahan
 * worker mati (petak sisa tetap di antrean), dan bisa diproses paralel.
 */
class ImportOsmTileJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Satu petak = satu request Overpass. Cukup singkat, jadi retry_after default aman.
    public int $timeout = 120;

    // Overpass sering kena rate-limit sesaat → beri kesempatan retry dengan jeda menaik.
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
        // Batch dibatalkan (mis. admin membatalkan) → jangan proses petak lagi.
        if ($this->batch()?->cancelled()) {
            return;
        }

        $processed = $service->importTile($this->south, $this->west, $this->north, $this->east);

        // Akumulasi counter run secara ATOMIK (aman meski beberapa worker paralel).
        DB::table('osm_import_runs')->where('id', $this->runId)->update([
            'imported' => DB::raw('imported + '.$processed),
            'processed_tiles' => DB::raw('processed_tiles + 1'),
            'updated_at' => now(),
        ]);

        // Hormati rate-limit Overpass (jeda antar petak seperti impor sinkron).
        if ($this->sleep > 0) {
            usleep((int) ($this->sleep * 1_000_000));
        }
    }

    /**
     * Dipanggil saat petak ini gagal permanen (retry habis). allowFailures() pada batch
     * membuat kegagalan satu petak tidak menggagalkan seluruh impor.
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
