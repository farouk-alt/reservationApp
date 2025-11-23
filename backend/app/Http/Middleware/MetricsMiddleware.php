<?php

namespace App\Http\Middleware;

use Closure;
use App\Services\MetricsService;

class MetricsMiddleware
{
    public function handle($request, Closure $next)
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = microtime(true) - $start;

        try {
            app(MetricsService::class)->recordRequest(
                $request->method(),
                $request->path(),
                $response->getStatusCode(),
                $duration
            );
        } catch (\Throwable $e) {
            // Ignore metric errors in production path
        }

        return $response;
    }
}
