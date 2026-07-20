<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['name' => 'Perintis', 'min_points' => 0, 'order' => 1],
            ['name' => 'Penapak Jejak', 'min_points' => 1000, 'order' => 2],
            ['name' => 'Petualang Muda', 'min_points' => 3000, 'order' => 3],
            ['name' => 'Pengembara Nusantara', 'min_points' => 6000, 'order' => 4],
            ['name' => 'Penakluk Nusantara', 'min_points' => 10000, 'order' => 5],
            ['name' => 'Legenda Nuravers', 'min_points' => 15000, 'order' => 6],
        ];

        foreach ($levels as $level) {
            Level::updateOrCreate(
                ['name' => $level['name']],
                $level
            );
        }
    }
}
