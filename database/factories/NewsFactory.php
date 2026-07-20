<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsFactory extends Factory
{
    protected $model = News::class;

    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'title' => fake()->sentence(6),
            'content' => fake()->paragraphs(3, true),
            'publish_date' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
