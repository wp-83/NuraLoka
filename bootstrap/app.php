<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsBanned;
use App\Http\Middleware\SetLocale;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        Authenticate::redirectUsing(function ($request) {
            return route('auth.login.index');
        });

        $middleware->web(append: [
            SetLocale::class,          // set locale sebelum props Inertia di-share
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => IsAdmin::class,
            'unbanned' => IsBanned::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpExceptionInterface $e, $request) {

            if ($request->expectsJson()) {
                return;
            }

            return Inertia::render('Error/Index', [
                'status' => $e->getStatusCode(),
            ])->toResponse($request)
                ->setStatusCode($e->getStatusCode());

        });
    })->create();
