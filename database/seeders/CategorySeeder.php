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
        // Daftar kategori tetap & distinct. Sebelumnya memakai
        // Category::factory()->count(8) yang memakai faker randomElement
        // (dengan pengembalian), sehingga nama kategori bisa terduplikasi.
        $categories = [
            'Wisata Alam', 'Wisata Budaya', 'Wisata Kuliner',
            'Wisata Sejarah', 'Wisata Pantai', 'Wisata Gunung',
            'Wisata Edukasi', 'Wisata Religi',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
