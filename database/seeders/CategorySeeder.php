<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Wisata Alam', 'Wisata Budaya', 'Wisata Kuliner',
            'Wisata Sejarah', 'Wisata Pantai', 'Wisata Gunung',
            'Wisata Edukasi', 'Wisata Religi',
        ];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}
