<?php

use Illuminate\Support\Facades\Route;
use App\Services\MetricsService;

Route::get('/metrics', function () {
    $service = new MetricsService();
    return response($service->renderMetrics(), 200)
        ->header('Content-Type', 'text/plain; version=0.0.4');
});