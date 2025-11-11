<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\EmployeAuthController;

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/profile', [AdminAuthController::class, 'profile']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
});

# --- EMPLOYE ROUTES ---
Route::post('/employe/register', [EmployeAuthController::class, 'register']);
Route::post('/employe/login', [EmployeAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employe/profile', [EmployeAuthController::class, 'profile']);
    Route::post('/employe/logout', [EmployeAuthController::class, 'logout']);
});
// -------------------------------------------------------------
// 🧱 API ENDPOINTS
// -------------------------------------------------------------

// Employés
// Only admin can manage employes, salles
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('salles', SalleController::class);

    Route::apiResource('employes', EmployeController::class);
    Route::apiResource('reservations', ReservationController::class);
});


// Optional filters (custom routes)
Route::get('reservations/employe/{num_emp}', [ReservationController::class, 'byEmployee']);
Route::get('reservations/salle/{num_salle}', [ReservationController::class, 'bySalle']);
