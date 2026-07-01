<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class XullCategorySeeder extends Seeder
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
            DB::table('categories')->insertOrIgnore([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
