<?php

namespace App\Http;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Http\Kernel as HttpKernel;



class Kernel extends HttpKernel
{
    /**
     * The application's route middleware.
     */
    protected $routeMiddleware = [
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
        'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
    ];
}
