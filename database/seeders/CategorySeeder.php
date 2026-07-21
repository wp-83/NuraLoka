<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Kategori wisata yang relevan untuk NuraLoka.
     * Data final untuk presentasi.
     */
    public function run(): void
    {
        $categories = [
            'Wisata Alam',
            'Wisata Budaya',
            'Kuliner',
            'Museum',
            'Taman Hiburan',
            'Belanja',
            'Religi',
            'Hidden Gem',
        ];

        foreach ($categories as $name) {
            // insertOrIgnore() bypasses the Category model, so the slug must be
            // set explicitly here — otherwise every row after the first collides
            // on the same empty slug and gets silently dropped by "IGNORE".
            DB::table('categories')->insertOrIgnore([
                'name' => $name,
                'slug' => Str::slug($name),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
