<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SalleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement([
                'Salle de conférence',
                'Salle de formation',
                'Bureau de réunion',
                'Laboratoire informatique'
            ]),
            'capacite' => $this->faker->numberBetween(10, 100),
            'statut' => 'active',
        ];
    }
}
