<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\PlaceVisit;
use App\Models\User;
use Illuminate\Database\Seeder;

class PlaceVisitSeeder extends Seeder
{
    /**
     * Seed check-in dummy agar section "Ramai Dikunjungi" punya data untuk demo.
     * Distribusi sengaja tidak merata: sebagian place ramai, sebagian sepi/0.
     */
    public function run(): void
    {
        $userIds = User::pluck('id')->all();
        $places = Place::whereNotNull('latitude')->get();

        if (empty($userIds) || $places->isEmpty()) {
            $this->command->warn('Butuh users & places dulu — PlaceVisitSeeder dilewati.');

            return;
        }

        $maxPerPlace = min(count($userIds), 20);

        foreach ($places as $place) {
            $visitorCount = fake()->numberBetween(0, $maxPerPlace);
            if ($visitorCount === 0) {
                continue; // sebagian place memang belum ada pengunjung
            }

            // randomElements memilih user unik (tanpa duplikat) → pengunjung unik.
            foreach (fake()->randomElements($userIds, $visitorCount) as $uid) {
                PlaceVisit::updateOrCreate(
                    ['user_id' => $uid, 'place_id' => $place->id],
                    [
                        'latitude' => (float) $place->latitude + fake()->randomFloat(5, -0.001, 0.001),
                        'longitude' => (float) $place->longitude + fake()->randomFloat(5, -0.001, 0.001),
                        'visited_at' => now()->subDays(fake()->numberBetween(0, 45)),
                    ]
                );
            }
        }

        $this->command->info('PlaceVisit seeded. Total place_visits: '.PlaceVisit::count());
    }
}
