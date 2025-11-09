<?php

use Tests\TestCase;
use App\Models\Salle;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SalleTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_salle()
    {
        // CREATE
        $response = $this->postJson('/api/salles', [
            'type' => 'Salle de réunion',
            'capacite' => 15,
            'statut' => 'active',
        ]);

        $response->assertStatus(201);
        $id = $response->json('id');

        // READ
        $this->getJson('/api/salles')->assertJsonFragment(['type' => 'Salle de réunion']);

        // UPDATE
        $this->putJson("/api/salles/{$id}", ['type' => 'Salle VIP'])->assertStatus(200);

        // DELETE
        $this->deleteJson("/api/salles/{$id}")->assertStatus(200);
    }
}
