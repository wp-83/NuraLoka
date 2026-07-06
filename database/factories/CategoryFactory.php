<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Wisata Alam', 'Wisata Budaya', 'Wisata Kuliner',
            'Wisata Sejarah', 'Wisata Pantai', 'Wisata Gunung',
            'Wisata Edukasi', 'Wisata Religi',
        ];

        return [
            'name' => $this->faker->randomElement($categories),
        ];
    }
}
