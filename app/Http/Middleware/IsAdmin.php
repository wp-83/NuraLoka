<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_admin && ($request->user()->email === 'admin@nuraloka.id' || $request->user()->username === 'admin_nuraloka')) {
            return $next($request);
        }

        abort(403, 'Unauthorized action.');
    }
}
