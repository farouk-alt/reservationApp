<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Salle;
use App\Models\Employe;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'num_emp' => Employe::factory(),
            'num_salle' => Salle::factory(),
            'date_res' => now()->addDays(rand(1, 7))->toDateString(),
            'heure_res' => $this->faker->time(),
            'duree_minutes' => $this->faker->numberBetween(60, 360),
            'statut' => $this->faker->randomElement(['en_attente', 'confirmée', 'modifiée']),
        ];
    }
}
