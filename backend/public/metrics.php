<?php

use Prometheus\RenderTextFormat;

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

/** @var \App\Services\PrometheusService $prometheus */
$prometheus = $app->make(\App\Services\PrometheusService::class);

/** @var \Prometheus\CollectorRegistry $registry */
$registry = $prometheus->getRegistry();

$renderer = new RenderTextFormat();

header('Content-Type: ' . RenderTextFormat::MIME_TYPE);

echo $renderer->render($registry->getMetricFamilySamples());
