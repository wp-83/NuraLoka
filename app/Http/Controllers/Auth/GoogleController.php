<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    // 1. Redirect user to Google for authentication
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    // 2. Handle callback from Google after authentication
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user with the same email already exists in our database
            $user = User::query()->where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // if not, create a new user with the information from Google
                $user = User::create([
                    'username' => $this->generateUniqueUsername($googleUser->getName()),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => null, // No password since user will login with Google
                    'email_verified_at' => now(), // Mark email as verified since it's coming from Google
                ]);
            } else {
                // if user already exists, update the google_id in case it's not set
                $user->update(['google_id' => $googleUser->getId()]);
            }

            // Login the user into the application
            Auth::login($user);

            // Redirect to the intended page after login, or fallback to homepage
            return redirect()->intended('/');

        } catch (\Exception $e) {
            dd($e->getMessage());

            return redirect('/')->with('error', 'Gagal login menggunakan Google.');
        }
    }

    /**
     * Generate a unique username based on the user's name.
     */
    private function generateUniqueUsername($name)
    {
        // 1. Change the user's name into a slug format (lowercase, no spaces, etc.)
        $baseUsername = Str::slug($name, '');
        $username = $baseUsername;

        // 2. Check if the username already exists in the users table. If it does, add random numbers until we find a unique one.
        while (User::query()->where('username', $username)->exists()) {
            // ... add random numbers to the end of the base username until we find one that doesn't exist in the database
            $username = $baseUsername.rand(100, 999);
        }

        // 3. If the loop stops (meaning the username is unique), return it
        return $username;
    }
}
