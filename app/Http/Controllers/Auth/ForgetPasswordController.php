<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ForgetPasswordController extends Controller
{
    public function index(Request $request)
    {
        if ($request->session()->get('password_reset_sent')){
            return redirect()->route('auth.forget-password.success');
        }

        return inertia('Auth/ForgetPassword');
    }

    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            $request->session()->put('password_reset_sent', true);
            return redirect()->route('auth.forget-password.success');
        }
    }

    public function sendSuccess(Request $request)
    {
        if (! $request->session()->get('password_reset_sent')) {
            return redirect()->route('auth.forget-password.index');
        }

        return inertia('Auth/ForgetPasswordSuccess');
    }

    public function resetPass(Request $request, string $token)
    {
        $request->session()->forget('password_reset_sent');

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($token, $record->token)) {
            return redirect()->route('auth.login.index')->with([
                'flash.type' => 'warning',
                'flash.message' => 'Token reset kata sandi sudah tidak valid.', 
            ]);
        }

        $user = User::select('id', 'email')
            ->with('userDetails:user_id,fullname')
            ->where('email', $request->email)
            ->firstOrFail();

        return inertia('Auth/ResetPassword', [
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'same:confirmPassword',
                'min:10',
                'max:50',
                'regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/',
            ],
            'confirmPassword' => ['required', 'same:password'],
        ]);

        $status = Password::reset(
            [
                'email' => $request->email,
                'password' => $request->password,
                'password_confirmation' => $request->confirmPassword,
                'token' => $request->token,
            ],
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return back()->withErrors([
                'email' => __($status),
            ]);
        }

        return redirect()->route('auth.login.index')->with([
            'flash.type' => 'success',
            'flash.message' => 'Kata sandi berhasil diperbarui.',
        ]);
    }
}
