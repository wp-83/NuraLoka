<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    /** Bahasa yang bisa dipilih user (kode => label tampil di switcher). */
    private const LOCALES = [
        'id' => 'Indonesia',
        'en' => 'English',
        'ko' => '한국어',
    ];

    /** Grup file lang yang dikirim ke frontend (dikecualikan: validation & passwords — server-side). */
    private const FRONTEND_GROUPS = [
        'nav', 'common', 'home', 'explore', 'footer', 'auth',
        'account', 'challenge', 'album', 'news', 'profile', 'wishlist', 'error', 'pagination', 'admin',
    ];

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'fullname' => $user->userDetail?->fullname,
                    'is_admin' => $user->is_admin,
                    'public_profile_photo' => $user->public_profile_photo,
                ] : null,
            ],

            'flash' => [
                'type' => fn () => $request->session()->get('flash.type'),
                'message' => fn () => $request->session()->get('flash.message'),
            ],

            // Lokalisasi: bahasa aktif + daftar pilihan + pesan terjemahan untuk frontend.
            // locale & translations sebagai CLOSURE agar diresolusi saat response dirender —
            // yaitu SETELAH middleware SetLocale menetapkan locale (Inertia memanggil share()
            // di fase request, sebelum SetLocale, sehingga nilai eager akan tertinggal).
            'locale' => fn () => app()->getLocale(),
            'locales' => self::LOCALES,
            'translations' => fn () => $this->translations(app()->getLocale()),
        ]);
    }

    /**
     * Kumpulkan pesan terjemahan grup-grup UI untuk $locale, dengan fallback ke locale
     * cadangan sehingga key yang belum diterjemahkan tetap tampil (bukan kosong).
     */
    private function translations(string $locale): array
    {
        $fallback = config('app.fallback_locale', 'id');
        $out = [];

        foreach (self::FRONTEND_GROUPS as $group) {
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
