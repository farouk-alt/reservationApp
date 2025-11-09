<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Employe;

class EmployeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_employes()
    {
        Employe::factory()->count(3)->create();

        $response = $this->getJson('/api/employes');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_can_create_an_employe()
    {
        $data = [
            'nom' => 'Test',
            'prenom' => 'User',
            'departement' => 'IT',
            'username' => 'tuser',
            'password' => 'secret123',
            'email' => 'tuser@example.com'
        ];

        $response = $this->postJson('/api/employes', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment(['nom' => 'Test']);
    }

    /** @test */
    public function it_can_update_an_employe()
    {
        $emp = Employe::factory()->create();

        $response = $this->putJson("/api/employes/{$emp->id}", [
            'departement' => 'Finance'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['departement' => 'Finance']);
    }

    /** @test */
    public function it_can_delete_an_employe()
    {
        $emp = Employe::factory()->create();

        $response = $this->deleteJson("/api/employes/{$emp->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('employes', ['id' => $emp->id]);
    }
}
