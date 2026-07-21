<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /** Switch the active locale: store the choice in the session, then return to the previous page. */
    public function switch(Request $request, string $locale)
    {
        if (in_array($locale, SetLocale::SUPPORTED, true)) {
            $request->session()->put('locale', $locale);
        }

        return back();
    }
}
