<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_root_returns_404()
    {
        $response = $this->get('/');

        $response->assertStatus(404);
    }
}
