<?php

namespace App\Services;

use Prometheus\CollectorRegistry;
use Prometheus\Storage\InMemory;
use Prometheus\RenderTextFormat;

class PrometheusService
{
    protected $registry;

    public function __construct()
    {
        // Use shared in-memory store
        $this->registry = new CollectorRegistry(new InMemory());
    }

    public function getRegistry()
    {
        return $this->registry;
    }

    // REQUIRED: return all metrics in Prometheus format
    public function getMetrics()
    {
        $renderer = new RenderTextFormat();
        return $renderer->render($this->registry->getMetricFamilySamples());
    }
}
