<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Employe;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EmployeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_list_employes()
    {
        Employe::factory()->count(3)->create();

        $response = $this->getJson('/api/employes');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_it_can_create_an_employe()
    {
        $payload = [
            'nom'        => 'John',
            'prenom'     => 'Doe',
            'departement'=> 'IT',
            'username'   => 'john123',
            'password'   => 'secret123',
            'email'      => 'john@example.com',
        ];

        $response = $this->postJson('/api/employes', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['nom' => 'John']);

        $this->assertDatabaseCount('employes', 1);
    }

    public function test_it_can_update_an_employe()
    {
        $employe = Employe::factory()->create();

        $response = $this->putJson("/api/employes/$employe->id", [
            'departement' => 'Finance',
        ]);

        // Controller returns ONLY the updated object → adjust test
        $response->assertStatus(200)
            ->assertJsonFragment(['departement' => 'Finance']);
    }

    public function test_it_can_delete_an_employe()
    {
        $employe = Employe::factory()->create();

        $this->deleteJson("/api/employes/$employe->id")
            ->assertStatus(200);

        // SQLite resets autoincrement → use assertDatabaseMissing by id
        $this->assertDatabaseMissing('employes', [
            'id' => $employe->id
        ]);
    }
}
