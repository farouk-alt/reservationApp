<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\PrometheusServiceProvider::class, // ← Add this line
    App\Services\DatabaseMetricsService::class, // ← Add this

];