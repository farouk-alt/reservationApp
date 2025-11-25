<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\PrometheusService;

class PrometheusServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PrometheusService::class, function ($app) {
            return new PrometheusService();
        });
    }

    public function boot(): void
    {
        //
    }
}