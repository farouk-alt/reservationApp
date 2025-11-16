<?php

namespace App\Http;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Console\Scheduling\Schedule;



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

    protected $middlewareGroups = [
    'api' => [
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \App\Http\Middleware\MetricsMiddleware::class,
    ],
    ];


    protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        \App\Models\Reservation::where('statut', 'confirmée')
            ->whereRaw("ADDTIME(heure_res, SEC_TO_TIME(duree * 3600)) < CURTIME()")
            ->where('date_res', now()->toDateString())
            ->update(['statut' => 'terminée']);
    })->hourly(); // runs every hour
}

}
