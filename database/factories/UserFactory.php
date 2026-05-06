<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username'           => $this->faker->unique()->userName(),
            'email'              => $this->faker->unique()->safeEmail(),
            'google_id'          => null,
            'email_verified_at'  => now(),
            'password'           => bcrypt('password'),
            'remember_token'     => Str::random(10),
            'created_at'         => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at'         => now(),
        ];
    }

    /** User belum verifikasi email */
    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    /** User login via Google */
    public function googleAuth(): static
    {
        return $this->state(fn () => [
            'google_id' => $this->faker->numerify('####################'),
            'password'  => null,
        ]);
    }
}