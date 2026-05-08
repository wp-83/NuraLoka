<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect the user to Google for authentication as a login flow.
     */
    public function redirectLogin()
    {
        session(['google_auth_mode' => 'login']);

        return Socialite::driver('google')->redirect();
    }

    /**
     * Redirect the user to Google for authentication as a registration flow.
     */
    public function redirectRegister()
    {
        session(['google_auth_mode' => 'register']);

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback response from Google after authentication.
     */
    public function callback()
    {
        try {
            /**
             * Get the authentication mode from the session.
             * If the mode does not exist, use "login" as the default mode.
             */
            $mode = session()->pull('google_auth_mode', 'login');

            /**
             * Retrieve the authenticated Google user information.
             */
            $googleUser = Socialite::driver('google')->user();

            $email = $googleUser->getEmail();
            $googleId = $googleUser->getId();

            /**
             * Check whether a user with the same email already exists
             * in the local users table.
             */
            $user = User::where('email', $email)->first();

            /*
            |--------------------------------------------------------------------------
            | Google Registration Flow
            |--------------------------------------------------------------------------
            | This flow is used when the user clicks "Sign Up with Google".
            |
            | Rules:
            | - If the email already exists, do not create a new account.
            | - Redirect the user to the login page instead.
            | - If the email does not exist, create a new user in the users table.
            | - After creating the user, log them in and redirect them to
            |   the detail account page to complete their profile information.
            */
            if ($mode === 'register') {
                if ($user) {
                    return redirect()
                        ->route('auth.login')
                        ->with('error', 'This Google account is already registered. Please sign in instead.');
                }

                $user = User::create([
                    'username' => $this->generateUsernameFromEmail($email),
                    'email' => $email,
                    'google_id' => $googleId,
                    'password' => null,
                    'email_verified_at' => now(),
                ]);

                Auth::login($user);
                request()->session()->regenerate();

                return redirect()->route('auth.register.detail');
            }

            /*
            |--------------------------------------------------------------------------
            | Google Login Flow
            |--------------------------------------------------------------------------
            | This flow is used when the user clicks "Sign In with Google".
            |
            | Rules:
            | - If the email does not exist, do not register the user automatically.
            | - Redirect the user to the registration page instead.
            | - If the email exists, log the user in.
            */
            if (! $user) {
                return redirect()
                    ->route('auth.register')
                    ->with('error', 'This Google account is not registered yet. Please sign up first.');
            }

            /*
            |--------------------------------------------------------------------------
            | Link Existing Local Account with Google
            |--------------------------------------------------------------------------
            | If the user previously registered manually using the same email,
            | but the google_id is still empty, connect that account with
            | the authenticated Google account.
            */
            if (! $user->google_id) {
                $user->update([
                    'google_id' => $googleId,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            }

            /**
             * Log the user into the application and regenerate the session
             * to prevent session fixation attacks.
             */
            Auth::login($user);
            request()->session()->regenerate();

            /**
             * Redirect the user to their intended page,
             * or to the homepage if no intended page exists.
             */
            return redirect()->intended('/');

        } catch (\Throwable $e) {
            /**
             * Report the exception to Laravel's logging system.
             * Avoid using dd() in production because it can expose sensitive data.
             */
            report($e);

            return redirect()
                ->route('auth.login')
                ->with('error', 'Failed to authenticate with Google.');
        }
    }

    /**
     * Generate a unique username from the user's email address.
     *
     * Example:
     * - Email: vergie@example.com
     * - Base username: vergie
     *
     * If the generated username already exists, random numbers will be
     * appended until a unique username is found.
     */
    private function generateUsernameFromEmail(string $email): string
    {
        /**
         * Get the part of the email before the "@" symbol.
         */
        $baseUsername = Str::before($email, '@');

        /**
         * Convert the base username into a slug format.
         * This removes unsupported characters and spaces.
         */
        $baseUsername = Str::slug($baseUsername, '');

        /**
         * Use a default username if the email prefix cannot be converted
         * into a valid username.
         */
        if ($baseUsername === '') {
            $baseUsername = 'user';
        }

        $username = $baseUsername;

        /**
         * Keep generating a new username while the current username
         * already exists in the database.
         */
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername.rand(100, 999);
        }

        return $username;
    }
}
