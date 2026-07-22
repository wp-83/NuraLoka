<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Sets the application locale per request, from the language the user chose
 * (stored in the session).
 *
 * It governs the backend (__(), validation) and is also the source of the locale
 * shared with the frontend (see HandleInertiaRequests). Supported: id, en, ko.
 *
 * Runs BEFORE HandleInertiaRequests, so the locale is already correct by the
 * time props are shared.
 */
class SetLocale
{
    /** The languages the system supports. The first is the default when the
     *  session is empty or holds something invalid. */
    public const SUPPORTED = ['id', 'en', 'ko'];

    public function handle(Request $request, Closure $next)
    {
        app()->setLocale(self::resolve($request->session()->get('locale')));

        return $next($request);
    }

    /**
     * Normalise a locale code to a supported language. Null or invalid input
     * falls back to config('app.locale'), and then to SUPPORTED[0] as the last
     * safety net.
     *
     * Also used by the exception handler (the Error page), which can run before
     * this middleware has had a chance to set the locale.
     */
    public static function resolve(?string $locale): string
    {
        if (in_array($locale, self::SUPPORTED, true)) {
            return $locale;
        }

        $config = config('app.locale');

        return in_array($config, self::SUPPORTED, true) ? $config : self::SUPPORTED[0];
    }
}
