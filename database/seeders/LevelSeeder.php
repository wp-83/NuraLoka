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
            ['name' => 'Pemula', 'min_points' => 0, 'order' => 1],
            ['name' => 'Penjelajah Muda', 'min_points' => 1000, 'order' => 2],
            ['name' => 'Petualang', 'min_points' => 2000, 'order' => 3],
            ['name' => 'Eksplorer Nusantara', 'min_points' => 6000, 'order' => 4],
            ['name' => 'Master Eksplorer', 'min_points' => 10000, 'order' => 5],
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
