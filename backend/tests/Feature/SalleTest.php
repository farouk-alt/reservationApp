<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SalleTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_salle()
    {
        // CREATE
        $response = $this->postJson('/api/salles', [
            'type'     => 'Salle de réunion',
            'capacite' => 20,
            'code'     => 'A12'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['type' => 'Salle de réunion']);

        $id = $response->json('id');

        // READ
        $this->getJson("/api/salles/$id")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $id]);

        // UPDATE
        $this->putJson("/api/salles/$id", [
            'type' => 'Salle modifiée',
        ])->assertStatus(200)
          ->assertJsonFragment(['type' => 'Salle modifiée']);

        // DELETE
        $this->deleteJson("/api/salles/$id")
            ->assertStatus(200);

        $this->assertDatabaseMissing('salles', ['id' => $id]);
    }
}
