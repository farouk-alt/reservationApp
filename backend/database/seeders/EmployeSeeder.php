<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employe;
use Illuminate\Support\Facades\Hash;

class EmployeSeeder extends Seeder
{
    public function run(): void
    {
        Employe::create([
            'nom' => 'Meftah',
            'prenom' => 'Anas',
            'departement' => 'Informatique',
            'username' => 'ameftah',
            'password' => Hash::make('password'),
            'email' => 'anas@example.com',
        ]);
    }
}
