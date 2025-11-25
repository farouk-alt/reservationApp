<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

class ApiAuthenticate
{
    // public function handle(Request $request, Closure $next, ...$guards)
    // {
    //     if (empty($guards)) {
    //         $guards = [null];
    //     }

    //     foreach ($guards as $guard) {
    //         if (auth()->guard($guard)->check()) {
    //             return $next($request);
    //         }
    //     }

    //     throw new AuthenticationException(
    //         'Unauthenticated.', $guards
    //     );
    // }
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            throw new AuthenticationException('Unauthenticated.');
        }

        return $next($request);
    }

}