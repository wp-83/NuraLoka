<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Display the login page.
     */
    public function show()
    {
        return inertia('Auth/Login');
    }

    /**
     * Authenticate the user.
     */
    public function login(Request $request)
    {
        $request->validate([
            'identity' => 'required|string',
            'password' => 'required|string',
            'rememberMe' => 'boolean',
        ]);

        // Detect whether the input is an email or username.
        $loginField = filter_var(
            $request->identity,
            FILTER_VALIDATE_EMAIL
        )
            ? 'email'
            : 'username';

        $credentials = [
            $loginField => $request->identity,
            'password' => $request->password,
        ];

        if (! Auth::attempt(
            $credentials,
            $request->boolean('rememberMe')
        )) {
            return redirect()
                ->route('auth.login.index')
                ->with([
                    'flash.type' => 'error',
                    'flash.message' => 'Data Anda tidak valid.',
                ]);
        }

        /*
         * Prevent banned users from logging in.
         */
        if (Auth::user()->is_banned) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('auth.login.index')
                ->with([
                    'flash.type' => 'error',
                    'flash.message' => 'Akun Anda telah diblokir.',
                ]);
        }

        /*
         * Regenerate the session ID after successful authentication.
         */
        $request->session()->regenerate();

        /*
         * Redirect the main administrator to the admin dashboard.
         */
        if (
            Auth::user()->is_admin &&
            (
                Auth::user()->email === 'admin@nuraloka.id' ||
                Auth::user()->username === 'admin_nuraloka'
            )
        ) {
            return redirect()
                ->route('admin.dashboard.index');
        }

        return redirect()
            ->route('home.index');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('landing-page.index');
    }
}
