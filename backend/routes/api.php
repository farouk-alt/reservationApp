<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\EmployeAuthController;
use App\Http\Controllers\PasswordResetController;

/*
|--------------------------------------------------------------------------
| 🔐 AUTHENTICATION ROUTES
|--------------------------------------------------------------------------
*/

// 🧱 Admin Auth
Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Profile & Password management
    Route::get('/admin/profile', [AdminAuthController::class, 'profile']);
    Route::put('/admin/profile', [AdminAuthController::class, 'updateProfile']);
    Route::put('/admin/password', [AdminAuthController::class, 'updatePassword']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
});

// 👷 Employé Auth
Route::post('/employe/register', [EmployeAuthController::class, 'register']);
Route::post('/employe/login', [EmployeAuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function () {
    // Profile & Password management
    Route::get('/employe/profile', [EmployeAuthController::class, 'profile']);
    Route::put('/employe/profile', [EmployeAuthController::class, 'updateProfile']);
    Route::put('/employe/password', [EmployeAuthController::class, 'updatePassword']);
    Route::post('/employe/logout', [EmployeAuthController::class, 'logout']);
});


/*
|--------------------------------------------------------------------------
| 🧱 BUSINESS LOGIC ROUTES (CRUD)
|--------------------------------------------------------------------------
*/

// 🏢 Admin-only resources
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('salles', SalleController::class);
    Route::apiResource('employes', EmployeController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::get('/salles/{id}/calendar', [SalleController::class, 'calendar']);
    Route::get('/salles/{id}/calendar/all', [SalleController::class, 'calendarAll']);


});


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('reservations', ReservationController::class);
    Route::get('/reservations/employe/{num_emp}', [ReservationController::class, 'byEmployee']);
    Route::get('/reservations/salle/{num_salle}', [ReservationController::class, 'bySalle']);
    Route::put('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

});
use App\Http\Controllers\AdminController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'stats']);
});
