<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TripPhoto;
use App\Models\Place;

class CheckMonas extends Command
{
    protected $signature = 'check:monas';

    public function handle()
    {
        $place = Place::where('slug', 'monas-monumen-nasional')->first();
        if ($place) {
            $this->info('Place ID: ' . $place->id);
            $photos = TripPhoto::where('place_id', $place->id)->get();
            $this->info('Photos with this place_id: ' . $photos->count());
            
            // Are there any photos in albums where destination_name matches this place name?
            $albumPhotos = TripPhoto::whereHas('album.trip', function($q) use ($place) {
                $q->where('destination_name', $place->name);
            })->get();
            $this->info('Photos in albums with destination_name = ' . $place->name . ': ' . $albumPhotos->count());
            
            foreach($albumPhotos as $p) {
                $this->info('Photo ID: ' . $p->id . ', place_id: ' . ($p->place_id ?? 'null'));
            }
        } else {
            $this->info('Place not found.');
        }
    }
}
