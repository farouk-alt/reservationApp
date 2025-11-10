<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Reservation;
use App\Models\Salle;
use App\Models\Employe;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_reservations()
    {
        $emp = Employe::factory()->create();
        $salle = Salle::factory()->create();

        Reservation::factory()->create([
            'num_emp' => $emp->id,
            'num_salle' => $salle->id,
        ]);

        $response = $this->getJson('/api/reservations');

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    /** @test */
    public function it_can_create_a_reservation()
    {
        $emp = Employe::factory()->create();
        $salle = Salle::factory()->create();

        $data = [
            'num_emp' => $emp->id,
            'num_salle' => $salle->id,
            'date_res' => '2025-11-10',
            'heure_res' => '09:00:00',
            'duree' => 2,
            'statut' => 'confirmée',
        ];

        $response = $this->postJson('/api/reservations', $data);

        $response->assertStatus(201)
                ->assertJsonPath('reservation.statut', 'confirmée');

    }

    /** @test */
    public function it_can_update_a_reservation()
    {
        $emp = Employe::factory()->create();
        $salle = Salle::factory()->create();

        $reservation = Reservation::factory()->create([
            'num_emp' => $emp->id,
            'num_salle' => $salle->id,
        ]);

        $response = $this->putJson("/api/reservations/{$reservation->id}", [
            'statut' => 'modifiée'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['statut' => 'modifiée']);
    }

    /** @test */
    public function it_can_delete_a_reservation()
    {
        $emp = Employe::factory()->create();
        $salle = Salle::factory()->create();

        $reservation = Reservation::factory()->create([
            'num_emp' => $emp->id,
            'num_salle' => $salle->id,
        ]);

        $response = $this->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('reservations', ['id' => $reservation->id]);
    }
}
