<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Menetapkan locale aplikasi per-request dari pilihan bahasa user (disimpan di session).
 * Berlaku untuk backend (__(), validasi) sekaligus menjadi sumber locale yang di-share
 * ke frontend (lihat HandleInertiaRequests). Bahasa yang didukung: id, en, ko.
 *
 * Dijalankan SEBELUM HandleInertiaRequests agar locale sudah benar saat props di-share.
 */
class SetLocale
{
    /** Bahasa yang didukung sistem. Urutan pertama = default bila session kosong/invalid. */
    public const SUPPORTED = ['id', 'en', 'ko'];

    public function handle(Request $request, Closure $next)
    {
        $locale = $request->session()->get('locale');

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = config('app.locale');
            if (! in_array($locale, self::SUPPORTED, true)) {
                $locale = self::SUPPORTED[0];
            }
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
