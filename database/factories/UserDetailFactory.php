<?php

namespace Database\Factories;

use App\Models\Level;
use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserDetailFactory extends Factory
{
    protected $model = UserDetail::class;

    public function definition(): array
    {
        $points = $this->faker->numberBetween(0, 5000);

        return [
            'user_id' => User::factory(),
            'province_id' => Province::inRandomOrder('')->first()?->id,
            'fullname' => $this->faker->name(),
            'dob' => $this->faker->dateTimeBetween('-50 years', '-18 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'unspecified']),
            'total_points' => $points,
            'level_id' => Level::idForPoints($points),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
