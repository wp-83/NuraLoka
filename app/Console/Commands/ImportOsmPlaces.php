<?php

namespace App\Console\Commands;

use App\Models\OsmPlace;
use App\Services\OsmImportService;
use Illuminate\Console\Command;

class ImportOsmPlaces extends Command
{
    /**
     * Contoh:
     *   php artisan osm:import --region=jawa-tengah
     *   php artisan osm:import --south=-7.1 --west=109.0 --north=-6.8 --east=109.4
     *   php artisan osm:import --region=indonesia --tile=0.5 --sleep=3
     */
    protected $signature = 'osm:import
        {--region= : Preset area: slug provinsi (mis. jawa-tengah, sulawesi-selatan) atau indonesia}
        {--south= : Batas selatan (lat)}
        {--west= : Batas barat (lng)}
        {--north= : Batas utara (lat)}
        {--east= : Batas timur (lng)}
        {--tile=0.5 : Ukuran petak (derajat) per query Overpass}
        {--sleep=2 : Jeda detik antar petak (hormati rate-limit)}';

    protected $description = 'Impor POI dari Overpass (OSM) ke tabel osm_places (server-side, sekali jalan).';

    public function handle(OsmImportService $service): int
    {
        [$south, $west, $north, $east] = $this->resolveBounds($service);
        if ($south === null) {
            return self::FAILURE;
        }

        $tile = (float) $this->option('tile');
        $sleep = (float) $this->option('sleep');

        $this->info("Impor OSM untuk bbox [{$south}, {$west}, {$north}, {$east}] — petak {$tile}°");

        $totalTiles = $service->totalTiles($south, $west, $north, $east, $tile);
        $bar = $this->output->createProgressBar($totalTiles);
        $bar->start();

        $result = $service->import(
            $south, $west, $north, $east, $tile, $sleep,
            fn () => $bar->advance()
        );

        $bar->finish();
        $this->newLine(2);
        $this->info("Selesai. Titik tersimpan/diperbarui: {$result['imported']}. Petak gagal: {$result['failedTiles']}.");
        $this->line('Total osm_places sekarang: '.OsmPlace::count());

        return self::SUCCESS;
    }

    private function resolveBounds(OsmImportService $service): array
    {
        $region = $this->option('region');
        if ($region) {
            $bounds = $service->boundsForRegion($region);
            if ($bounds === null) {
                $this->error("Region '{$region}' tidak dikenal. Pilihan: ".implode(', ', array_keys(OsmImportService::REGIONS)));

                return [null, null, null, null];
            }

            return $bounds;
        }

        foreach (['south', 'west', 'north', 'east'] as $opt) {
            if ($this->option($opt) === null) {
                $this->error('Sertakan --region ATAU keempat batas --south --west --north --east.');

                return [null, null, null, null];
            }
        }

        return [
            (float) $this->option('south'),
            (float) $this->option('west'),
            (float) $this->option('north'),
            (float) $this->option('east'),
        ];
    }
}
