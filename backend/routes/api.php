<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ReservationController;

// -------------------------------------------------------------
// 🔐 Default Sanctum user route (you can keep this as is)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// -------------------------------------------------------------
// 🧱 API ENDPOINTS
// -------------------------------------------------------------

// Employés
Route::apiResource('employes', EmployeController::class);

// Salles
Route::apiResource('salles', SalleController::class);

// Réservations
Route::apiResource('reservations', ReservationController::class);

// Optional filters (custom routes)
Route::get('reservations/employe/{num_emp}', [ReservationController::class, 'byEmployee']);
Route::get('reservations/salle/{num_salle}', [ReservationController::class, 'bySalle']);
