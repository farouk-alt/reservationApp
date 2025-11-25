<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\PrometheusService;
use Symfony\Component\HttpFoundation\Response;

class PrometheusMetrics
{
    private PrometheusService $prometheus;

    public function __construct(PrometheusService $prometheus)
    {
        $this->prometheus = $prometheus;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        
        $response = $next($request);
        
        $duration = microtime(true) - $start;
        
        $method = $request->method();
        $path = $this->normalizePath($request->path());
        $status = $response->getStatusCode();
        
        // Increment request counter
        $this->prometheus->incrementHttpRequest($method, $path, $status);
        
        // Observe duration
        $this->prometheus->observeHttpDuration($method, $path, $status, $duration);
        
        // Track errors
        if ($status >= 500) {
            $this->prometheus->incrementError($method, $path, $status);
        }
        
        return $response;
    }
    
    private function normalizePath(string $path): string
    {
        // Replace IDs with {id} for better grouping
        $path = preg_replace('/\/\d+/', '/{id}', $path);
        
        // Specific patterns for your app
        $path = preg_replace('/\/employe\/\d+/', '/employe/{id}', $path);
        $path = preg_replace('/\/salle\/\d+/', '/salle/{id}', $path);
        $path = preg_replace('/\/reservation\/\d+/', '/reservation/{id}', $path);
        
        return $path ?: '/';
    }
}