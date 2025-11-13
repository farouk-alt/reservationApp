<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use App\Models\Employe;
use App\Models\User;
use App\Models\Reservation;

class AdminController extends Controller
{
    public function stats()
    {
        // General counts
        $salles = Salle::count();
        $employes = Employe::count();
        $admins = User::count();
        $reservations = Reservation::count();

        // Salle activity
        $activeSalles = Salle::where('statut', 'active')->count();
        $inactiveSalles = Salle::where('statut', 'inactive')->count();



        // Reservation stats
        $canceled = Reservation::where('statut', 'annulée')->count();
        $finished = Reservation::where('statut', 'terminée')->count();

        // Most reserved salles
        $topSalles = Reservation::selectRaw('num_salle, COUNT(*) as total')
            ->groupBy('num_salle')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // Reservations per month
        $reservationsPerMonth = Reservation::selectRaw("
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total
            ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            "salles" => $salles,
            "employes" => $employes,
            "admins" => $admins,
            "reservations" => $reservations,

            "active_salles" => $activeSalles,
            "inactive_salles" => $inactiveSalles,

            "canceled_reservations" => $canceled,
            "finished_reservations" => $finished,

            "top_salles" => $topSalles,
            "reservations_per_month" => $reservationsPerMonth,
        ]);
    }
}
