<?php

namespace App\Services\Localization;

/**
 * The UI translation groups sent to the frontend.
 *
 * Shared by HandleInertiaRequests (the normal prop sharing) and by the exception
 * handler (the Error page), so translations are still available when an error
 * happens BEFORE or outside the HandleInertiaRequests pipeline — an unknown-route
 * 404, or a 419 from VerifyCsrfToken.
 */
class FrontendTranslations
{
    /** The lang groups sent to the frontend. validation and passwords are
     *  excluded: they are server-side only. */
    public const GROUPS = [
        'nav', 'common', 'home', 'explore', 'footer', 'auth',
        'account', 'challenge', 'album', 'news', 'profile', 'wishlist', 'error', 'pagination', 'admin', 'landing',
        'title', // Page titles (<title>), used by MainLayout and AdminLayout.
    ];

    /**
     * Collect the UI translation groups for $locale, layered over the fallback
     * locale so a key that has not been translated yet still renders text rather
     * than nothing.
     *
     * @return array<string, mixed>
     */
    public function for(string $locale): array
    {
        $fallback = config('app.fallback_locale', 'id');
        $out = [];

        foreach (self::GROUPS as $group) {
            $base = $this->loadGroup($fallback, $group);
            $out[$group] = $locale === $fallback
                ? $base
                : array_replace_recursive($base, $this->loadGroup($locale, $group));
        }

        return $out;
    }

    /** Load one lang file (lang/{locale}/{group}.php) as an array; [] if absent. */
    private function loadGroup(string $locale, string $group): array
    {
        $path = lang_path("{$locale}/{$group}.php");

        return is_file($path) ? (array) require $path : [];
    }
}
