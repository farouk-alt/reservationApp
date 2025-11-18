<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Reservation;
use App\Models\Employe;
use App\Models\Salle;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload($overrides = [])
    {
        $default = [
            'num_salle'     => Salle::factory()->create()->id,
            'date_res'      => now()->toDateString(),
            'heure_res'     => now()->addHour()->format('H:i'),
            'duree_minutes' => 60,
        ];

        return array_merge($default, $overrides);
    }

    public function test_it_can_list_reservations()
    {
        Reservation::factory()->count(3)->create();

        $response = $this->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_it_can_create_a_reservation()
    {
        $user = Employe::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson('/api/reservations', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => '✅ Réservation créée avec succès !']);

        $this->assertDatabaseCount('reservations', 1);
    }

    public function test_it_can_update_a_reservation()
    {
        $user = Employe::factory()->create();
        $this->actingAs($user);

        $reservation = Reservation::factory()->create(['num_emp' => $user->id]);

        $response = $this->putJson("/api/reservations/$reservation->id", [
            'date_res'      => now()->toDateString(),
            'heure_res'     => now()->addHours(2)->format('H:i'),
            'duree_minutes' => 90,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Mise à jour effectuée']);
    }

    public function test_it_can_delete_a_reservation()
    {
        $reservation = Reservation::factory()->create();

        $this->deleteJson("/api/reservations/$reservation->id")
            ->assertStatus(200);

        $this->assertDatabaseMissing('reservations', [
            'id' => $reservation->id
        ]);
    }
}
