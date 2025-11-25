<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\APC;

class PrometheusService
{
    private static ?CollectorRegistry $registry = null;
    private string $namespace = 'reservation_app';

    public function __construct()
    {
        if (self::$registry === null) {
            self::$registry = new CollectorRegistry(new APC());
        }
    }

    // Existing HTTP metrics...
    public function incrementHttpRequest(string $method, string $path, int $status): void
    {
        $counter = self::$registry->getOrRegisterCounter(
            $this->namespace,
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'path', 'status']
        );
        $counter->inc([$method, $path, (string) $status]);
    }

    public function observeHttpDuration(string $method, string $path, int $status, float $duration): void
    {
        $histogram = self::$registry->getOrRegisterHistogram(
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
        $counter = self::$registry->getOrRegisterCounter(
            $this->namespace,
            'http_errors_total',
            'Total HTTP errors (5xx)',
            ['method', 'path', 'status']
        );
        $counter->inc([$method, $path, (string) $status]);
    }

    // NEW: Database metrics
    public function incrementDatabaseQuery(string $table, string $operation): void
    {
        $counter = self::$registry->getOrRegisterCounter(
            $this->namespace,
            'database_queries_total',
            'Total database queries',
            ['table', 'operation']
        );
        $counter->inc([$table, $operation]);
    }

    public function observeDatabaseQueryDuration(string $table, float $duration): void
    {
        $histogram = self::$registry->getOrRegisterHistogram(
            $this->namespace,
            'database_query_duration_seconds',
            'Database query duration in seconds',
            ['table'],
            [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
        );
        $histogram->observe($duration, [$table]);
    }

    // NEW: Business metrics
    public function incrementReservation(string $action, string $status): void
    {
        $counter = self::$registry->getOrRegisterCounter(
            $this->namespace,
            'reservations_total',
            'Total reservations by action and status',
            ['action', 'status']
        );
        $counter->inc([$action, $status]);
    }

    public function setActiveUsers(int $count): void
    {
        $gauge = self::$registry->getOrRegisterGauge(
            $this->namespace,
            'active_users',
            'Number of active users'
        );
        $gauge->set($count);
    }

    public function render(): string
    {
        $renderer = new RenderTextFormat();
        return $renderer->render(self::$registry->getMetricFamilySamples());
    }
}