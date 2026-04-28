<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    // 1. Melempar user ke halaman Google
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    // 2. Menerima balikan dari Google
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah user ini sudah pernah login/daftar
            $user = User::query()->where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // Kalau belum ada, kita buatkan akun baru
                $user = User::create([
                    'username' => $this->generateUniqueUsername($googleUser->getName()),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => null, // Password dikosongkan
                    'email_verified_at' => now(), // Anggap email Google sudah pasti valid
                ]);
            } else {
                // Kalau sudah ada emailnya, update google_id nya (untuk jaga-jaga)
                $user->update(['google_id' => $googleUser->getId()]);
            }

            // Login-kan user ke dalam sistem Laravel
            Auth::login($user);

            // Lempar ke halaman dashboard React via Inertia
            return redirect()->intended('/');

        } catch (\Exception $e) {
            dd($e->getMessage());

            return redirect('/')->with('error', 'Gagal login menggunakan Google.');
        }
    }

    /**
     * Fungsi untuk mengenerate username unik dari nama Google.
     */
    private function generateUniqueUsername($name)
    {
        // 1. Ubah "Budi Santoso" menjadi "budisantoso" (hilangkan spasi & karakter aneh)
        $baseUsername = Str::slug($name, '');
        $username = $baseUsername;

        // 2. Lakukan pengecekan ke database berulang kali (looping)
        // Selama username tersebut sudah ada di tabel users, maka...
        while (User::query()->where('username', $username)->exists()) {
            // ...tambahkan 3 angka acak di belakangnya (contoh: budisantoso482)
            $username = $baseUsername.rand(100, 999);
        }

        // 3. Jika perulangannya berhenti (berarti username-nya belum ada yang punya), kembalikan nilainya
        return $username;
    }
}
