<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$prometheus = $app->make(\App\Services\PrometheusService::class);

header('Content-Type: text/plain');

echo $prometheus->getMetrics();
