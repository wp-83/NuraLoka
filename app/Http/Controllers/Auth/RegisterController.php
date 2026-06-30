<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /**
     * Display the registration view.
     */
    public function show()
    {
        if (session()->has('register_user_id')) {
            return redirect(route('auth.register.detail'));
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|lowercase|max:40|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:10|max:50|regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/|same:confirmPassword',
            'confirmPassword' => 'required|string|same:password',
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        session(['register_user_id' => $user->id]);

        return redirect()->route('auth.register.detail');
    }

    public function detail()
    {
        if (! session()->has('register_user_id')) {
            return redirect(route('auth.register.index'));
        }

        $provinces = Province::select('id', 'name')->get();

        return inertia('Auth/DetailAcount', [
            'provinces' => $provinces,
            'fullname' => session('google_fullname'),
        ]);
    }

    public function saveAccountDetail(Request $request)
    {
        $validatedData = $request->validate([
            'fullname' => 'required|string|max:255',
            'dob' => 'required|date',
            'gender' => 'required|in:male,female,unspecified',
            'province' => 'required|exists:provinces,id',
        ]);

        $user = User::findOrFail(session('register_user_id'));

        UserDetail::create([
            'fullname' => $validatedData['fullname'],
            'dob' => $validatedData['dob'],
            'gender' => $validatedData['gender'],
            'province_id' => $validatedData['province'],
            'user_id' => $user->id,
        ]);

        session()->forget([
            'register_user_id',
            'google_fullname',
        ]);
        Auth::login($user);

        return redirect()->route('/');
    }
}
