<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\Redis;

class MetricsService
{
    private CollectorRegistry $registry;

    public function __construct()
    {
        $adapter = new Redis([
            'host'         => env('REDIS_HOST', 'redis'),
            'port'         => (int) env('REDIS_PORT', 6379),
            'password'     => null,
            'timeout'      => 0.1,
            'read_timeout' => 0.1,
        ]);

        $this->registry = new CollectorRegistry($adapter, true);
    }

    /**
     * Record one HTTP request
     */
    public function recordRequest(string $method, string $path, int $statusCode, float $durationSeconds): void
    {
        // We’ll reuse these labels for all metrics
        $labels = [$method, '/' . ltrim($path, '/'), (string) $statusCode];

        // 1) Total requests
        $requests = $this->registry->getOrRegisterCounter(
            'reservation_app',
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status_code']
        );
        $requests->inc($labels);

        // 2) Duration histogram (seconds)
        $durationHistogram = $this->registry->getOrRegisterHistogram(
            'reservation_app',
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'endpoint', 'status_code'],
            [0.05, 0.1, 0.2, 0.5, 1, 2, 5] // buckets
        );
        $durationHistogram->observe($durationSeconds, $labels);

        // 3) Error counter (only 5xx)
        if ($statusCode >= 500) {
            $errors = $this->registry->getOrRegisterCounter(
                'reservation_app',
                'http_errors_total',
                'Total 5xx HTTP responses',
                ['method', 'endpoint', 'status_code']
            );
            $errors->inc($labels);
        }
    }

    public function incrementErrors(): void
    {
        $errors = $this->registry->getOrRegisterCounter(
            'reservation_app',
            'app_errors_total',
            'Total application errors'
        );
        $errors->inc();
    }

    /**
     * Return all metrics in Prometheus format
     */
    public function renderMetrics(): string
    {
        $renderer = new RenderTextFormat();

        return $renderer->render(
            $this->registry->getMetricFamilySamples()
        );
    }
}
