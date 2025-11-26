<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use App\Services\MetricsService;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $metricsService;

    public function __construct(\Illuminate\Contracts\Container\Container $container, MetricsService $metricsService)
    {
        parent::__construct($container);
        $this->metricsService = $metricsService;
    }
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            $this->metricsService->incrementErrors();
        });
    }
    
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
