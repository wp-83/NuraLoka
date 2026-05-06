<?php

namespace Database\Factories;

use App\Models\UserMission;
use App\Models\User;
use App\Models\Mission;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserMissionFactory extends Factory
{
    protected $model = UserMission::class;

    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'mission_id' => Mission::inRandomOrder()->first()?->id ?? 1,
            'status'     => $this->faker->randomElement(['ongoing', 'completed']),
            'created_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'updated_at' => now(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed']);
    }

    public function ongoing(): static
    {
        return $this->state(fn () => ['status' => 'ongoing']);
    }
}