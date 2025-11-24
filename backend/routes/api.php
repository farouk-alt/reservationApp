<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\EmployeAuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminController;
use App\Services\PrometheusService;

// Public Auth Routes
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/employe/register', [EmployeAuthController::class, 'register']);
Route::post('/employe/login', [EmployeAuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Public Routes
Route::get('/salles', [SalleController::class, 'index']);
Route::get('/salles/{id}', [SalleController::class, 'show']);

// Protected Routes - Use api.auth instead of auth:sanctum
Route::middleware('api.auth:sanctum')->group(function () {
    // Admin
    Route::get('/admin/profile', [AdminAuthController::class, 'profile']);
    Route::put('/admin/profile', [AdminAuthController::class, 'updateProfile']);
    Route::put('/admin/password', [AdminAuthController::class, 'updatePassword']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    
    // Employé
    Route::get('/employe/profile', [EmployeAuthController::class, 'profile']);
    Route::put('/employe/profile', [EmployeAuthController::class, 'updateProfile']);
    Route::put('/employe/password', [EmployeAuthController::class, 'updatePassword']);
    Route::post('/employe/logout', [EmployeAuthController::class, 'logout']);
    
    // Resources
    Route::apiResource('salles', SalleController::class)->except(['index', 'show']);
    Route::apiResource('employes', EmployeController::class);
    Route::get('/salles/{id}/calendar', [SalleController::class, 'calendar']);
    Route::get('/salles/{id}/calendar/all', [SalleController::class, 'calendarAll']);
    
    // Reservations
    Route::apiResource('reservations', ReservationController::class);
    Route::get('/reservations/employe/{num_emp}', [ReservationController::class, 'byEmployee']);
    Route::get('/reservations/salle/{num_salle}', [ReservationController::class, 'bySalle']);
    Route::put('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    
    // Stats
    Route::get('/admin/stats', [AdminController::class, 'stats']);
});

Route::get('/metrics', function (PrometheusService $prometheus) {
    $registry = $prometheus->getRegistry();
    $renderer = new \Prometheus\RenderTextFormat();

    $metrics = $renderer->render($registry->getMetricFamilySamples());

    return response($metrics)
        ->header('Content-Type', 'text/plain');
});