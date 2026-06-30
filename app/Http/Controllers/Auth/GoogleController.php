<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        /*
        |--------------------------------------------------------------------------
        | Get Google Auth Mode
        |--------------------------------------------------------------------------
        | This value tells us whether the user came from:
        | - Sign in with Google
        | - Sign up with Google
        |
        | In this controller, both flows are allowed to create or login the user.
        */
        $mode = session()->pull('google_auth_mode', 'login');

        /*
        |--------------------------------------------------------------------------
        | Get Google User Data
        |--------------------------------------------------------------------------
        | This retrieves the authenticated Google account information.
        */
        $googleUser = Socialite::driver('google')->user();

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
        $user = User::where('email', $email)->first();

        /*
        |--------------------------------------------------------------------------
        | Create Basic Account If User Does Not Exist
        |--------------------------------------------------------------------------
        | This applies to both login and registration flow.
        |
        | If the user clicks "Login with Google" but the account does not exist,
        | the system will automatically create a basic account and redirect the
        | user to the detail account page.
        |
        | The user is not logged in yet because their detail account data is
        | still incomplete.
        */
        if (! $user) {
            $user = User::create([
                'username' => $this->generateUsernameFromEmail($email),
                'email' => $email,
                'google_id' => $googleId,
                'password' => null,
                'email_verified_at' => now(),
            ]);

            session([
                'register_user_id' => $user->id,
                'google_fullname' => $googleName,
            ]);

            return redirect()->route('auth.register.detail');
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
        | Login Existing Complete Account
        |--------------------------------------------------------------------------
        | If the user already exists and the detail account is complete, log them
        | in automatically.
        |
        | This also handles the case where the user clicks "Sign Up with Google"
        | even though their account already exists.
        */
        auth()->login($user);
        request()->session()->regenerate();

        return redirect()->intended('/');
    }

    /**
     * Generate a unique username from the user's email address.
     */
    private function generateUsernameFromEmail(string $email): string
    {
        /*
        |--------------------------------------------------------------------------
        | Get Email Prefix
        |--------------------------------------------------------------------------
        | Example:
        | vergie@example.com becomes vergie
        */
        $baseUsername = Str::before($email, '@');

        /*
        |--------------------------------------------------------------------------
        | Convert Username to Slug
        |--------------------------------------------------------------------------
        | This removes unsupported characters and spaces.
        */
        $baseUsername = Str::slug($baseUsername, '');

        /*
        |--------------------------------------------------------------------------
        | Fallback Username
        |--------------------------------------------------------------------------
        | If the email prefix cannot be converted into a valid username,
        | use "user" as the default base username.
        */
        if ($baseUsername === '') {
            $baseUsername = 'user';
        }

        $username = $baseUsername;

        /*
        |--------------------------------------------------------------------------
        | Ensure Username is Unique
        |--------------------------------------------------------------------------
        | If the username already exists, append random numbers.
        */
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername.rand(100, 999);
        }

        return $username;
    }
}
