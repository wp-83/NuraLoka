<?php

namespace Database\Factories;

use App\Models\UserDetails;
use App\Models\User;
use App\Models\Province;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserDetailsFactory extends Factory
{
    protected $model = UserDetails::class;

    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'province_id'   => Province::inRandomOrder()->first()?->id ?? 1,
            'name'          => $this->faker->name(),
            'profile_path'  => 'profiles/' . $this->faker->uuid() . '.jpg',
            'dob'           => $this->faker->dateTimeBetween('-50 years', '-18 years')->format('Y-m-d'),
            'gender'        => $this->faker->randomElement(['male', 'female', 'unspecified']),
            'total_points'  => $this->faker->numberBetween(0, 5000),
            'created_at'    => now(),
            'updated_at'    => now(),
        ];
    }
}