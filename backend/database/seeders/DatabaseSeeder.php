<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::create([
        'name' => 'Admin',
        'email' => 'admin@example.com',
        'password' => bcrypt('admin123'),
    ]);
    \App\Models\Employe::create([
        'nom' => 'Doe',
        'prenom' => 'John',
        'departement' => 'IT',
        'username' => 'john.doe',
        'email' => 'john@example.com',
        'password' => bcrypt('password123'),
    ]);

        // User::factory(10)->create();
        // $this->call(SalleSeeder::class);
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
