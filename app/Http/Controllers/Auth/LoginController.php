<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function show()
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'identity' => 'required|string',
            'password' => 'required|string',
            'rememberMe' => 'boolean',
        ]);

        // Deteksi whether the input is email or username
        $loginField = filter_var($request->identity, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $loginField => $request->identity,
            'password' => $request->password,
        ];

        if (! Auth::attempt($credentials, $request->boolean('rememberMe'))) {
            return redirect()->route('auth.login.index')->with([
                'flash.type' => 'error',
                'flash.message' => 'Data Anda tidak valid.',
            ]);
        }

        $request->session()->regenerate();

        if (Auth::user()->is_admin && (Auth::user()->email === 'admin@nuraloka.id' || Auth::user()->username === 'admin_nuraloka')) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('home');
    }

    /**
     * Destroy an authenticated session (logout).
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('landing-page.index');

    }
}
