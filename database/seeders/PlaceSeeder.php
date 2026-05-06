<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Place;
use Illuminate\Database\Seeder;

class PlaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        // Buat 20 destinasi
        Place::factory()->count(20)->create()->each(function ($place) use ($categories) {
            // Setiap place dapat 1-3 kategori secara acak
            $randomCategories = $categories->random(rand(1, 3))->pluck('id');
            $place->categories()->attach($randomCategories);
        });
    }
}
