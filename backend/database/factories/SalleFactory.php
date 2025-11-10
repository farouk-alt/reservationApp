<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SalleFactory extends Factory
{
    public function definition(): array
    {
        $etage = $this->faker->numberBetween(1, 5);
        $lettre = $this->faker->randomElement(['A', 'B', 'C', 'D']);
        
        return [
            'type' => $this->faker->randomElement([
                'Salle de conférence',
                'Salle de formation',
                'Bureau',
                'Laboratoire informatique'
            ]),
            'capacite' => $this->faker->numberBetween(10, 80),
            'statut' => 'active',
            'code' => "{$etage}{$lettre}", // ✅ always set code
        ];
    }
}
