<?php

namespace App\Http\Middleware;

use Closure;
use Prometheus\CollectorRegistry;
use App\Services\PrometheusService;

class PromMetricsMiddleware
{
    protected $registry;
    public function __construct(PrometheusService $prometheus)
    {
        $this->registry = $prometheus->getRegistry();
    }

    public function handle($request, Closure $next)
    {
        $histogram = $this->registry->getOrRegisterHistogram(
            'reservation_app',
            'request_duration_seconds',
            'Time spent handling requests',
            ['method', 'uri'],
            [0.1, 0.3, 1, 3, 5]
        );

        $start = microtime(true);
        $response = $next($request);

        $histogram->observe(
            microtime(true) - $start,
            [$request->method(), $request->path()]
        );

        return $response;
    }
}
