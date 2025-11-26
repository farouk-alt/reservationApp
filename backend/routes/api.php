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
use Illuminate\Http\Request;

// ========================================
// 📊 PROMETHEUS METRICS ENDPOINT (PUBLIC)
// ========================================
Route::get('/metrics', function (PrometheusService $prometheus) {
    return response($prometheus->render())
        ->header('Content-Type', 'text/plain; version=0.0.4');
});

// Public Auth Routes
Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login');
Route::post('/employe/login', [EmployeAuthController::class, 'login'])->name('employe.login');

// Add a generic login route that redirects to appropriate login
Route::get('/login', function () {
    return response()->json(['message' => 'Please use /admin/login or /employe/login'], 401);
})->name('login');

Route::post('/employe/register', [EmployeAuthController::class, 'register']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Public Routes
Route::get('/salles', [SalleController::class, 'index']);
Route::get('/salles/{id}', [SalleController::class, 'show']);

// ✅ FIXED: Use built-in Sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
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

// Route::post('/web-vitals', function(Request $request) {
//     $prometheusService = new PrometheusService();
//     $prometheusService->observeWebVital($request->all());
//     return response()->json(['ok' => true]);
// });

Route::get('/test-alert', function () {
    throw new Exception("🔥 Test error message from backend");
});
// Temporary test route for database issues
Route::get('/test-db-error', function () {
    // Simulate database connection issue
// Temporary test route for database issues
Route::get('/test-db-error', function () {
    // Simulate database connection issue
    throw new \Illuminate\Database\QueryException(
        'test query',
        [],
        [],
        new Exception("Simulated database connection refused: Can't connect to MySQL server on 'mysql.reservation-app.svc.cluster.local' (111)")
    );
});
});
