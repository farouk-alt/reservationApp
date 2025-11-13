<?php
namespace App\Http\Controllers;

use App\Models\Salle;
    // GET /api/salles
    use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Reservation;
class SalleController extends Controller
{


public function index()
{
    $today = Carbon::now()->toDateString();
    $currentTime = Carbon::now()->format('H:i:s');

    // 1️⃣ Load salles with their active reservation for today
    $salles = Salle::with(['reservations' => function($q) use ($today, $currentTime) {
        $q->where('date_res', $today)
          ->whereRaw('? BETWEEN heure_res AND ADDTIME(heure_res, SEC_TO_TIME(duree_minutes * 3600))', [$currentTime])
          ->where('statut', 'confirmée');
    }])->get();

    // 2️⃣ Dynamically determine status + next available time
    $salles->transform(function ($salle) {
        // Active or inactive now
        $salle->statut = $salle->reservations->isNotEmpty() ? 'inactive' : 'active';

        // Find next reservation for this salle
        $nextReservation = \App\Models\Reservation::where('num_salle', $salle->id)
            ->where('date_res', '>=', now()->toDateString())
            ->orderBy('date_res')
            ->orderBy('heure_res')
            ->first();

        if ($nextReservation) {
            $endTime = date('H:i', strtotime($nextReservation->heure_res) + $nextReservation->duree_minutes * 3600);
            $salle->next_available = $nextReservation->date_res . ' à ' . $endTime; // ✅ date + hour
        } else {
            $salle->next_available = 'Disponible maintenant';
        }


        unset($salle->reservations);
        return $salle;
    });

    // 3️⃣ Return updated salles
    return response()->json($salles);
}

    // GET /api/salles/{id}
    public function show($id)
    {
        return Salle::findOrFail($id);
    }

    // POST /api/salles
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:50',
             'code' => 'required|string|unique:salles,code',
            'capacite' => 'required|integer|min:1',
            'statut' => 'nullable|string',
        ]);

        $salle = Salle::create($validated);
        return response()->json($salle, 201);
    }

    // PUT /api/salles/{id}
    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|max:50',
            'code' => 'required|unique:salles,code,' . $id,
            'capacite' => 'sometimes|integer|min:1',
            'statut' => 'nullable|string',
        ]);

        $salle->update($validated);
        return response()->json($salle);
    }

    // DELETE /api/salles/{id}
    public function destroy($id)
    {
        $salle = Salle::findOrFail($id);
        $salle->delete();

        return response()->json(['message' => 'Salle supprimée avec succès']);
    }
    public function calendar($id, Request $request)
{
    $date = $request->date;

    $reservations = Reservation::where('num_salle', $id)
        ->where('date_res', $date)
        ->with('employe') // 👈 ADD THIS
        ->orderBy('heure_res')
        ->get();

    return response()->json($reservations);
}
public function calendarAll($id)
{
    $reservations = \App\Models\Reservation::where('num_salle', $id)
        ->with('employe')
        ->orderBy('date_res')
        ->orderBy('heure_res')
        ->get();

    return response()->json($reservations);
}


}
