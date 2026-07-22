<?php

namespace App\Services\Localization;

/**
 * Kumpulan pesan terjemahan grup-grup UI yang dikirim ke frontend.
 *
 * Dipakai bersama oleh HandleInertiaRequests (share props normal) dan handler
 * exception (halaman Error/Index), sehingga terjemahan tetap tersedia meski
 * error terjadi SEBELUM/di luar pipeline HandleInertiaRequests (mis. 404 rute
 * tak dikenal atau 419 CSRF dari VerifyCsrfToken).
 */
class FrontendTranslations
{
    /** Grup file lang yang dikirim ke frontend (dikecualikan: validation & passwords — server-side). */
    public const GROUPS = [
        'nav', 'common', 'home', 'explore', 'footer', 'auth',
        'account', 'challenge', 'album', 'news', 'profile', 'wishlist', 'error', 'pagination', 'admin', 'landing',
        'title', // Judul halaman (<title>) — dipakai MainLayout & AdminLayout.
    ];

    /**
     * Kumpulkan pesan terjemahan grup-grup UI untuk $locale, dengan fallback ke locale
     * cadangan sehingga key yang belum diterjemahkan tetap tampil (bukan kosong).
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

    /** Muat satu file lang (lang/{locale}/{group}.php) sebagai array; [] bila tak ada. */
    private function loadGroup(string $locale, string $group): array
    {
        $path = lang_path("{$locale}/{$group}.php");

        return is_file($path) ? (array) require $path : [];
    }
}
