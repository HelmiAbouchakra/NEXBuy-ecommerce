<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtractJwtFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the request has JWT cookie
        if ($jwt = $request->cookie('jwt')) {
            // Add JWT to the Authorization header
            $request->headers->set('Authorization', 'Bearer ' . $jwt);
        }

        return $next($request);
    }
}