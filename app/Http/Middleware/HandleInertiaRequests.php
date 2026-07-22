<?php

namespace App\Http\Middleware;

use App\Services\Daerah\GreetingResolver;
use App\Services\Localization\FrontendTranslations;
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

    /** The languages a user may pick (code => the label shown in the switcher). */
    private const LOCALES = [
        'id' => 'Indonesia',
        'en' => 'English',
        'ko' => '한국어',
    ];

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $user?->loadMissing('userDetail.level');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'fullname' => $user->userDetail?->fullname,
                    'is_admin' => $user->is_admin,
                    'public_profile_photo' => $user->public_profile_photo,
                    // The user's level, one source shared by the navbar and the
                    // profile page.
                    'level' => $user->userDetail?->level?->name,
                ] : null,
            ],

            'flash' => [
                'type' => fn () => $request->session()->get('flash.type'),
                'message' => fn () => $request->session()->get('flash.message'),
            ],

            // Localisation: the active language, the available choices, and the
            // translations for the frontend.
            //
            // locale and translations are CLOSURES so they resolve when the
            // response renders — that is, AFTER the SetLocale middleware has set
            // the locale. Inertia calls share() during the request phase, before
            // SetLocale, so an eager value would be the stale one.
            'locale' => fn () => app()->getLocale(),
            'locales' => self::LOCALES,
            'translations' => fn () => app(FrontendTranslations::class)->for(app()->getLocale()),

            // The regional greeting, DELIBERATELY independent of 'locale' above.
            // For a signed-in user their saved province (priority 1) is enough, so
            // the greeting is there on the first render with no flash of changing
            // text. Guests get the default payload, which the frontend then
            // refines through location detection.
            'daerah' => fn () => app(GreetingResolver::class)->forUser($request->user()),
        ]);
    }
}
