<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salle;

class SalleSeeder extends Seeder
{
    public function run(): void
    {
        $salles = [
            ['code' => '1A', 'type' => 'Salle de conférence', 'capacite' => 40, 'statut' => 'active'],
            ['code' => '2B', 'type' => 'Salle de formation', 'capacite' => 20, 'statut' => 'active'],
            ['code' => '3C', 'type' => 'Bureau de réunion', 'capacite' => 10, 'statut' => 'active'],
            ['code' => '4D', 'type' => 'Salle informatique', 'capacite' => 25, 'statut' => 'inactive'],
        ];

        foreach ($salles as $salle) {
            Salle::updateOrCreate(['code' => $salle['code']], $salle);
        }
    }
}
