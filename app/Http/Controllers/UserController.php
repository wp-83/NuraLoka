<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::select('id', 'username', 'name', 'email', 'is_admin', 'created_at')
            ->latest()
            ->paginate(10);

        return Inertia::render('User/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('User/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|lowercase|max:255|unique:users',
            'name'     => 'nullable|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'username' => $request->username,
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('User/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('User/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'username' => 'required|string|lowercase|max:255|unique:users,username,' . $user->id,
            'name'     => 'nullable|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'username' => $request->username,
            'name'     => $request->name,
            'email'    => $request->email,
        ]);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    
    
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
          $user = User::findOrFail($id);

        // Cegah user hapus akunnya sendiri
        if ($user->id === Auth::id()) {
            return redirect()->back()->withErrors([
                'error' => 'Kamu tidak bisa menghapus akun sendiri.',
            ]);
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}

