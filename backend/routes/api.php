<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\EmployeAuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminController;
use App\Services\MetricsService;


/*
|--------------------------------------------------------------------------
| 🔐 AUTHENTICATION ROUTES (PUBLIC - pas d'auth)
|--------------------------------------------------------------------------
*/

// 🧱 Admin Auth
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Admin Profile (sans auth temporairement)
Route::get('/admin/profile', [AdminAuthController::class, 'profile']);
Route::put('/admin/profile', [AdminAuthController::class, 'updateProfile']);
Route::put('/admin/password', [AdminAuthController::class, 'updatePassword']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout']);

// 👷 Employé Auth
Route::post('/employe/register', [EmployeAuthController::class, 'register']);
Route::post('/employe/login', [EmployeAuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Employé Profile (sans auth temporairement)
Route::get('/employe/profile', [EmployeAuthController::class, 'profile']);
Route::put('/employe/profile', [EmployeAuthController::class, 'updateProfile']);
Route::put('/employe/password', [EmployeAuthController::class, 'updatePassword']);
Route::post('/employe/logout', [EmployeAuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| 🧱 BUSINESS LOGIC ROUTES (SANS AUTH temporairement)
|--------------------------------------------------------------------------
*/

// 🏢 Salles, Employés, Réservations (public temporairement)
Route::apiResource('salles', SalleController::class);
Route::apiResource('employes', EmployeController::class);
Route::apiResource('reservations', ReservationController::class);
Route::get('/salles/{id}/calendar', [SalleController::class, 'calendar']);
Route::get('/salles/{id}/calendar/all', [SalleController::class, 'calendarAll']);

// Réservations supplémentaires
Route::get('/reservations/employe/{num_emp}', [ReservationController::class, 'byEmployee']);
Route::get('/reservations/salle/{num_salle}', [ReservationController::class, 'bySalle']);
Route::put('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

// Admin stats
Route::get('/admin/stats', [AdminController::class, 'stats']);
