<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class EmployeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'departement' => $this->faker->word(),
            'username' => $this->faker->unique()->userName(),
            'password' => Hash::make('password'),
            'email' => $this->faker->unique()->safeEmail(),
        ];
    }
}
