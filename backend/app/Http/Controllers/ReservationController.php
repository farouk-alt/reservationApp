<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Salle;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    // 📋 List all reservations
    public function index()
    {
        return Reservation::with(['employe', 'salle'])->orderBy('date_res', 'desc')->get();
    }

    // ➕ Create a new reservation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'num_emp' => 'required|exists:employes,id',
            'num_salle' => 'required|exists:salles,id',
            'date_res' => 'required|date',
            'heure_res' => 'required',
            'duree' => 'required|integer|min:1',
        ]);

        // ✅ Check if salle is available at that time
        $exists = Reservation::where('num_salle', $validated['num_salle'])
            ->where('date_res', $validated['date_res'])
            ->where(function ($q) use ($validated) {
                $q->where('heure_res', $validated['heure_res']);
            })
            ->exists();

        if ($exists) {
            return response()->json(['error' => '❌ Cette salle est déjà réservée à cette heure.'], 409);
        }

        $reservation = Reservation::create($validated);

        return response()->json([
            'message' => '✅ Réservation créée avec succès !',
            'reservation' => $reservation,
        ], 201);
    }

    // ✏️ Update
    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'date_res' => 'required|date',
            'heure_res' => 'required',
            'duree' => 'required|integer|min:1',
            'statut' => 'nullable|string',
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => '✅ Réservation mise à jour !',
            'reservation' => $reservation,
        ]);
    }

    // ❌ Delete
    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return response()->json(['message' => '🗑️ Réservation supprimée']);
    }

    // 🔎 Show one
    public function show(Reservation $reservation)
    {
        return $reservation->load(['employe', 'salle']);
    }
    public function byEmployee($num_emp)
{
    $reservations = \App\Models\Reservation::where('num_emp', $num_emp)
        ->with('salle')
        ->orderBy('date_res', 'desc')
        ->get();

    if ($reservations->isEmpty()) {
        return response()->json(['message' => 'Aucune réservation trouvée pour cet employé.'], 404);
    }

    return response()->json($reservations);
}

public function bySalle($num_salle)
{
    $reservations = \App\Models\Reservation::where('num_salle', $num_salle)
        ->with('employe')
        ->orderBy('date_res', 'desc')
        ->get();

    if ($reservations->isEmpty()) {
        return response()->json(['message' => 'Aucune réservation trouvée pour cette salle.'], 404);
    }

    return response()->json($reservations);
}

}

