<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Global middlewares
        // $middleware->statefulApi(); // IMPORTANT for SPA / token handling

        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->append(\App\Http\Middleware\PrometheusMetrics::class);

        // Register custom route middleware aliases
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\ApiAuthenticate::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {

        // Customize JSON response for failed authentication
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            return redirect()->guest('login');
        });
    })
    ->create();
