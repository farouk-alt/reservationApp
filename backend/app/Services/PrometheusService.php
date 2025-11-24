<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\InMemory;

class PrometheusService
{
    private CollectorRegistry $registry;
    private string $namespace = 'reservation_app';

    public function __construct()
    {
        $this->registry = new CollectorRegistry(new InMemory());
    }

    public function incrementHttpRequest(string $method, string $path, int $status): void
    {
        $counter = $this->registry->getOrRegisterCounter(
            $this->namespace,
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'path', 'status']
        );

        $counter->inc([$method, $path, (string) $status]);
    }

    public function observeHttpDuration(string $method, string $path, int $status, float $duration): void
    {
        $histogram = $this->registry->getOrRegisterHistogram(
            $this->namespace,
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'path', 'status'],
            [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
        );

        $histogram->observe($duration, [$method, $path, (string) $status]);
    }

    public function incrementError(string $method, string $path, int $status): void
    {
        $counter = $this->registry->getOrRegisterCounter(
            $this->namespace,
            'http_errors_total',
            'Total HTTP errors (5xx)',
            ['method', 'path', 'status']
        );

        $counter->inc([$method, $path, (string) $status]);
    }

    public function render(): string
    {
        $renderer = new RenderTextFormat();
        return $renderer->render($this->registry->getMetricFamilySamples());
    }
}