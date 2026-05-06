<?php

namespace Database\Factories;

use App\Models\Badge;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserBadgeFactory extends Factory
{
    protected $model = UserBadge::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'badge_id' => Badge::inRandomOrder()->first()?->id ?? 1,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => now(),
        ];
    }
}
