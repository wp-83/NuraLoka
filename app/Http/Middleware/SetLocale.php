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
        app()->setLocale(self::resolve($request->session()->get('locale')));

        return $next($request);
    }

    /**
     * Normalisasi kode locale ke bahasa yang didukung. Bila null/invalid, jatuh ke
     * config('app.locale'), lalu ke SUPPORTED[0] sebagai jaring pengaman terakhir.
     *
     * Dipakai juga oleh handler exception (halaman Error) yang bisa berjalan sebelum
     * middleware ini sempat menetapkan locale.
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
