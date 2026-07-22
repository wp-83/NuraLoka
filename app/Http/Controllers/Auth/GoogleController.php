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
        session([
            'google_auth_mode' => 'login',
        ]);

        return Socialite::driver('google')->redirect();
    }

    /**
     * Redirect the user to Google for authentication as a registration flow.
     */
    public function redirectRegister()
    {
        session([
            'google_auth_mode' => 'register',
        ]);

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback response from Google after authentication.
     */
    public function callback()
    {
        /*
        |--------------------------------------------------------------------------
        | Get Google User
        |--------------------------------------------------------------------------
        | Retrieve the authenticated Google account information.
        */
        $googleUser = Socialite::driver('google')->user();

        /*
        |--------------------------------------------------------------------------
        | Get Google Auth Mode
        |--------------------------------------------------------------------------
        | Retrieve and remove the authentication mode from the session.
        */
        $mode = session()->pull(
            'google_auth_mode',
            'login'
        );

        /*
        |--------------------------------------------------------------------------
        | Get Google User Data
        |--------------------------------------------------------------------------
        */
        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();
        $googleName = $googleUser->getName();

        /*
        |--------------------------------------------------------------------------
        | Find Existing User
        |--------------------------------------------------------------------------
        | Email is used as the main identifier because one email should only
        | belong to one local user account.
        */
        $user = User::where(
            'email',
            $email
        )->first();

        /*
        |--------------------------------------------------------------------------
        | Create Basic Account If User Does Not Exist
        |--------------------------------------------------------------------------
        | This applies to both login and registration flow.
        |
        | The user is not logged in yet because their detail account data is
        | still incomplete.
        */
        if (! $user) {
            $user = User::create([
                'username' => $this->generateUsernameFromEmail(
                    $email
                ),
                'email' => $email,
                'google_id' => $googleId,
                'password' => null,
                'email_verified_at' => now(),
            ]);

            session([
                'register_user_id' => $user->id,
                'google_fullname' => $googleName,
            ]);

            return redirect()
                ->route('auth.register.detail');
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Banned User From Logging In
        |--------------------------------------------------------------------------
        | An existing banned account cannot use Google authentication to bypass
        | the account restriction.
        */
        if ($user->is_banned) {
            Auth::login($user);

            request()
                ->session()
                ->regenerate();

            return inertia('Auth/Banned');
        }

        /*
        |--------------------------------------------------------------------------
        | Link Existing Manual Account with Google
        |--------------------------------------------------------------------------
        | If the user registered manually before using the same email, but the
        | google_id is still empty, connect the local account to Google.
        */
        if (! $user->google_id) {
            $user->update([
                'google_id' => $googleId,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Login Existing Account
        |--------------------------------------------------------------------------
        */
        Auth::login($user);

        request()
            ->session()
            ->regenerate();

        /*
        |--------------------------------------------------------------------------
        | Redirect Administrator
        |--------------------------------------------------------------------------
        */
        if (
            $user->is_admin &&
            (
                $user->email === 'admin@nuraloka.id' ||
                $user->username === 'admin_nuraloka'
            )
        ) {
            return redirect()
                ->route('admin.dashboard.index');
        }

        /*
        |--------------------------------------------------------------------------
        | Redirect Regular User
        |--------------------------------------------------------------------------
        */
        return redirect()
            ->route('home.index');
    }

    /**
     * Generate a unique username from the user's email address.
     */
    private function generateUsernameFromEmail(
        string $email
    ): string {
        /*
        |--------------------------------------------------------------------------
        | Get Email Prefix
        |--------------------------------------------------------------------------
        | Example:
        | vergie@example.com becomes vergie
        */
        $baseUsername = Str::before(
            $email,
            '@'
        );

        /*
        |--------------------------------------------------------------------------
        | Convert Username to Slug
        |--------------------------------------------------------------------------
        | This removes unsupported characters and spaces.
        */
        $baseUsername = Str::slug(
            $baseUsername,
            ''
        );

        /*
        |--------------------------------------------------------------------------
        | Fallback Username
        |--------------------------------------------------------------------------
        */
        if ($baseUsername === '') {
            $baseUsername = 'user';
        }

        $username = $baseUsername;

        /*
        |--------------------------------------------------------------------------
        | Ensure Username is Unique
        |--------------------------------------------------------------------------
        */
        while (
            User::where(
                'username',
                $username
            )->exists()
        ) {
            $username =
                $baseUsername.rand(100, 999);
        }

        return $username;
    }
}
