<?php

namespace Database\Factories;

use App\Models\Place;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Place>
 */
class PlaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(rand(2, 4), true);
        $name = ucwords($name);

        // Coordinates around Indonesia
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(3),
            'latitude' => $this->faker->latitude(-8.5, -6.0),   // Java Island
            'longitude' => $this->faker->longitude(106.0, 111.0),
            'address' => $this->faker->address(),
        ];
    }
}
