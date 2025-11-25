<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservationCreatedMail;
use App\Mail\ReservationCanceledMail;
use App\Services\PrometheusService;
class ReservationController extends Controller
{

    private PrometheusService $prometheus;

    public function __construct(PrometheusService $prometheus)
    {
        $this->prometheus = $prometheus;
    }
    // 📋 List all reservations
    public function index()
    {
        return Reservation::with(['employe', 'salle'])
            ->orderBy('date_res', 'desc')
            ->get();
    }





    // ➕ Create a new reservation
public function store(Request $request)
{
    $validated = $request->validate([
        'num_salle'       => 'required|exists:salles,id',
        'date_res'        => 'required|date|after_or_equal:today|before_or_equal:' . now()->addDays(14)->format('Y-m-d'),
        'heure_res'       => 'required',
        'duree_minutes'   => 'required|integer|min:30|max:360',
    ]);

    // ❌ Sunday block
    if (date('w', strtotime($validated['date_res'])) == 0) {
        return response()->json(['error' => '❌ Il est interdit de réserver le dimanche.'], 403);
    }

    // ❌ start ≥ 17:00 block
    if (strtotime($validated['heure_res']) >= strtotime("17:00")) {
        return response()->json(['error' => '❌ Vous ne pouvez pas commencer une réservation à partir de 17h00.'], 403);
    }

    // ❌ Past time today
    $today = now()->toDateString();
    if ($validated['date_res'] === $today && $validated['heure_res'] < now()->format('H:i')) {
        return response()->json(['error' => '❌ Impossible de réserver dans le passé'], 422);
    }

    $num_emp = $request->user()->id;
    $start = $validated['heure_res'];
    $end = date('H:i:s', strtotime($start) + ($validated['duree_minutes'] * 60));

    // 🚫 Employee overlap (IGNORES canceled)
    $employeeOverlap = Reservation::where('num_emp', $num_emp)
        ->where('date_res', $validated['date_res'])
        ->where('statut', 'confirmée')
        ->where(function ($q) use ($start, $end) {
            $q->where('heure_res', '<', $end)
              ->whereRaw("ADDTIME(heure_res, SEC_TO_TIME(duree_minutes * 60)) > ?", [$start]);
        })
        ->exists();

    if ($employeeOverlap) {
        return response()->json(['error' => '❌ Vous avez déjà une réservation dans ce créneau.'], 409);
    }

    // 🚫 Salle overlap (IGNORES canceled)
    $salleOverlap = Reservation::where('num_salle', $validated['num_salle'])
        ->where('date_res', $validated['date_res'])
        ->where('statut', 'confirmée')
        ->where(function ($q) use ($start, $end) {
            $q->where('heure_res', '<', $end)
              ->whereRaw("ADDTIME(heure_res, SEC_TO_TIME(duree_minutes * 60)) > ?", [$start]);
        })
        ->exists();

    if ($salleOverlap) {
        return response()->json(['error' => '❌ Cette salle est déjà réservée dans ce créneau.'], 409);
    }

    // 🚫 Daily limit (IGNORES canceled)
    $dailyCount = Reservation::where('num_emp', $num_emp)
        ->where('date_res', $validated['date_res'])
        ->where('statut', 'confirmée')
        ->count();

    if ($dailyCount >= 3) {
        return response()->json(['error' => '⚠️ Limite de 3 réservations par jour.'], 403);
    }

    // ✅ Create
    $reservation = Reservation::create([
        'num_emp'       => $num_emp,
        'num_salle'     => $validated['num_salle'],
        'date_res'      => $validated['date_res'],
        'heure_res'     => $validated['heure_res'],
        'duree_minutes' => $validated['duree_minutes'],
        'statut'        => 'confirmée',
    ])->load('employe', 'salle');

    $this->prometheus->incrementReservation('created', 'success');


    // 📧 Email confirmation
    if ($reservation->employe && $reservation->employe->email) {
        Mail::to($reservation->employe->email)->send(new ReservationCreatedMail($reservation));
    }

    return response()->json([
        'message' => '✅ Réservation créée avec succès !',
        'reservation' => $reservation
    ], 201);
}








    // ✏️ Update
    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'date_res' => 'sometimes|required|date',
            'heure_res' => 'sometimes|required',
            'duree_minutes' => 'sometimes|required|integer|min:1',
            'statut' => 'sometimes|required|string',
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

    // 👤 Reservations by employee
   public function byEmployee($num_emp)
{
    $reservations = \App\Models\Reservation::where('num_emp', $num_emp)
        ->with('salle')
        ->orderBy('date_res', 'desc')
        ->get();

    return response()->json($reservations);
}




    // 🏢 Reservations by salle
    public function bySalle($num_salle)
    {
        $reservations = Reservation::where('num_salle', $num_salle)
            ->with('employe')
            ->orderBy('date_res', 'desc')
            ->get();

        if ($reservations->isEmpty()) {
            return response()->json(['message' => 'Aucune réservation trouvée pour cette salle.'], 404);
        }

        return response()->json($reservations);
    }



public function cancel($id)
{
    // Load reservation + employee
    $reservation = Reservation::with('employe')->findOrFail($id);

    // Update status
    $reservation->update(['statut' => 'annulée']);

    // Reactivate salle
    \App\Models\Salle::where('id', $reservation->num_salle)
        ->update(['statut' => 'active']);
    
    $this->prometheus->incrementReservation('cancelled', 'success');

    // 📧 Send cancellation email
    if ($reservation->employe && $reservation->employe->email) {
        Mail::to($reservation->employe->email)
            ->send(new ReservationCanceledMail($reservation));
    }

    return response()->json(['message' => '✅ Réservation annulée avec succès']);
}




public function upcoming()
{
    return Reservation::where('num_emp', Auth::user()->id)
        ->whereRaw("CONCAT(date_res, ' ', heure_res) >= ?", [now()])
        ->orderBy('date_res')
        ->orderBy('heure_res')
        ->take(5)          // next 5 reservations only
        ->get();
}
public function updateReservation(Request $request, Reservation $reservation)
{
    if ($reservation->num_emp !== auth()->id()) {
        return response()->json(['error' => 'Accès refusé'], 403);
    }

    $validated = $request->validate([
        'date_res'      => 'required|date|after_or_equal:today',
        'heure_res'     => 'required',
        'duree_minutes' => 'required|integer|min:30|max:360',
    ]);

    // ❌ Sunday
    if (date('w', strtotime($validated['date_res'])) == 0) {
        return response()->json(['error' => '❌ Modification impossible vers un dimanche.'], 403);
    }

    // ❌ 17h block
    if (strtotime($validated['heure_res']) >= strtotime("17:00")) {
        return response()->json(['error' => '❌ Heure de début invalide (≥ 17h00).'], 403);
    }

    $start = $validated['heure_res'];
    $end = date("H:i:s", strtotime($start) + ($validated['duree_minutes'] * 60));

    // 🚫 Salle overlap (ignore canceled)
    $salleConflict = Reservation::where('num_salle', $reservation->num_salle)
        ->where('date_res', $validated['date_res'])
        ->where('id', '!=', $reservation->id)
        ->where('statut', 'confirmée')
        ->where(function ($q) use ($start, $end) {
            $q->where('heure_res', '<', $end)
              ->whereRaw("ADDTIME(heure_res, SEC_TO_TIME(duree_minutes * 60)) > ?", [$start]);
        })
        ->exists();

    if ($salleConflict) {
        return response()->json(['error' => '❌ Conflit avec une autre réservation.'], 409);
    }

    // 🚫 Employee overlap (ignore canceled)
    $employeeOverlap = Reservation::where('num_emp', auth()->id())
        ->where('date_res', $validated['date_res'])
        ->where('id', '!=', $reservation->id)
        ->where('statut', 'confirmée')
        ->where(function ($q) use ($start, $end) {
            $q->where('heure_res', '<', $end)
              ->whereRaw("ADDTIME(heure_res, SEC_TO_TIME(duree_minutes * 60)) > ?", [$start]);
        })
        ->exists();

    if ($employeeOverlap) {
        return response()->json(['error' => '❌ Vous avez déjà une autre réservation dans ce créneau.'], 409);
    }

    // ✅ Update
    $reservation->update($validated);

    return response()->json([
        'message' => 'Mise à jour effectuée',
        'reservation' => $reservation
    ]);
}


public function conflicts(Request $request)
{
    $date = $request->date;
    $salle = $request->salle;

    $reservations = Reservation::where('num_salle', $salle)
        ->where('date_res', $date)
        ->orderBy('heure_res')
        ->get();

    return response()->json($reservations);
}


}
