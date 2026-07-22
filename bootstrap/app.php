<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsBanned;
use App\Http\Middleware\SetLocale;
use App\Services\Localization\FrontendTranslations;
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

            // Error bisa terjadi SEBELUM/di luar pipeline SetLocale + HandleInertiaRequests
            // (mis. 404 rute tak dikenal — tanpa web middleware; 419 CSRF dari VerifyCsrfToken
            // yang jalan sebelum middleware append). Tanpa ini, props translations/locale tak
            // ter-share sehingga t() menampilkan key mentah (mis. "error.titles.404").
            $locale = SetLocale::resolve($request->hasSession() ? $request->session()->get('locale') : null);
            app()->setLocale($locale);

            return Inertia::render('Error/Index', [
                'status' => $e->getStatusCode(),
                'locale' => $locale,
                'translations' => app(FrontendTranslations::class)->for($locale),
            ])->toResponse($request)
                ->setStatusCode($e->getStatusCode());

        });
    })->create();
