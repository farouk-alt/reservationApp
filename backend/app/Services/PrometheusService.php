<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\Storage\InMemory;

class PrometheusService
{
    protected $registry;

    public function __construct()
    {
        $this->registry = new CollectorRegistry(new InMemory());
    }

    public function getRegistry()
    {
        return $this->registry;
    }
}
