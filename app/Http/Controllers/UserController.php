<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->with([
                'userDetail.province',
            ])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where(
                            'username',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'email',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhereHas(
                            'userDetail',
                            function ($query) use ($search) {
                                $query->where(
                                    'fullname',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        );
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->where(
                    'is_admin',
                    $role === 'admin'
                );
            })
            ->when($request->gender, function ($query, $gender) {
                $query->whereHas(
                    'userDetail',
                    function ($query) use ($gender) {
                        $query->where(
                            'gender',
                            $gender
                        );
                    }
                );
            })
            ->when($request->status, function ($query, $status) {
                $query->where(
                    'is_banned',
                    $status === 'banned'
                );
            })
            ->orderByRaw(
                'CASE WHEN users.id = ? THEN 0 ELSE 1 END',
                [auth()->id()]
            )
            ->orderBy(
                UserDetail::select('fullname')
                    ->whereColumn(
                        'user_details.user_id',
                        'users.id'
                    )
            )
            ->paginate(10)
            ->withQueryString();

        return inertia(
            'Admin/User/Index',
            [
                'users' => $users,

                'filters' => $request->only([
                    'search',
                    'role',
                    'gender',
                    'status',
                ]),

                'statistics' => [
                    'total_users' => User::count(),

                    'total_regular_users' => User::where(
                        'is_admin',
                        false
                    )->count(),

                    'total_admins' => User::where(
                        'is_admin',
                        true
                    )->count(),

                    'total_banned_users' => User::where(
                        'is_banned',
                        true
                    )->count(),
                ],
            ]
        );
    }

    /**
     * Display the create user page.
     */
    public function create()
    {
        $provinces = Province::select(
            'id',
            'name'
        )
            ->orderBy('name')
            ->get();

        return inertia(
            'Admin/User/Create',
            [
                'provinces' => $provinces,
            ]
        );
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'lowercase',
                'max:40',
                'unique:users,username',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:10',
                'max:50',
                'regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/',
                'confirmed',
            ],

            'is_admin' => [
                'required',
                'boolean',
            ],

            'fullname' => [
                'required',
                'string',
                'max:255',
            ],

            'dob' => [
                'required',
                'date',
            ],

            'gender' => [
                'required',
                Rule::in([
                    'male',
                    'female',
                    'unspecified',
                ]),
            ],

            'province_id' => [
                'required',
                'exists:provinces,id',
            ],
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',
        ]);

        DB::transaction(
            function () use ($validated) {
                $user = User::create([
                    'username' => $validated['username'],

                    'email' => $validated['email'],

                    'password' => Hash::make(
                        $validated['password']
                    ),

                    'is_admin' => $validated['is_admin'],
                ]);

                $user->userDetail()->create([
                    'fullname' => $validated['fullname'],

                    'dob' => $validated['dob'],

                    'gender' => $validated['gender'],

                    'province_id' => $validated['province_id'],
                ]);
            }
        );

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' => 'Pengguna baru berhasil ditambahkan.',
            ]);
    }

    /**
     * Display the edit user page.
     */
    public function edit(User $user)
    {
        $user->load([
            'userDetail.province',
        ]);

        $provinces = Province::select(
            'id',
            'name'
        )
            ->orderBy('name')
            ->get();

        return inertia(
            'Admin/User/Edit',
            [
                'user' => $user,
                'provinces' => $provinces,
            ]
        );
    }

    /**
     * Update the specified user.
     */
    public function update(
        Request $request,
        User $user
    ) {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'lowercase',
                'max:40',
                Rule::unique(
                    'users',
                    'username'
                )->ignore($user->id),
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique(
                    'users',
                    'email'
                )->ignore($user->id),
            ],

            'password' => [
                'nullable',
                'string',
                'min:10',
                'max:50',
                'regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/',
                'confirmed',
            ],

            'is_admin' => [
                'required',
                'boolean',
            ],

            'fullname' => [
                'required',
                'string',
                'max:255',
            ],

            'dob' => [
                'required',
                'date',
            ],

            'gender' => [
                'required',
                Rule::in([
                    'male',
                    'female',
                    'unspecified',
                ]),
            ],

            'province_id' => [
                'required',
                'exists:provinces,id',
            ],
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',
        ]);

        DB::transaction(
            function () use (
                $user,
                $validated
            ) {
                $userData = [
                    'username' => $validated['username'],

                    'email' => $validated['email'],

                    'is_admin' => $validated['is_admin'],
                ];

                if (! empty($validated['password'])) {
                    $userData['password'] = Hash::make(
                        $validated['password']
                    );
                }

                $user->update($userData);

                $user->userDetail()->updateOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'fullname' => $validated['fullname'],

                        'dob' => $validated['dob'],

                        'gender' => $validated['gender'],

                        'province_id' => $validated['province_id'],
                    ]
                );
            }
        );

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' => 'Data pengguna berhasil diperbarui.',
            ]);
    }

    /**
     * Ban the specified user.
     */
    public function ban(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Anda tidak dapat memblokir akun sendiri.',
            ]);
        }

        if ($user->is_admin) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Akun admin tidak dapat diblokir.',
            ]);
        }

        if ($user->is_banned) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Pengguna sudah diblokir.',
            ]);
        }

        $user->update([
            'is_banned' => true,
        ]);

        /*
         * Immediately invalidate all active sessions
         * belonging to the banned user.
         */
        DB::table('sessions')
            ->where(
                'user_id',
                $user->id
            )
            ->delete();

        return back()->with([
            'flash.type' => 'success',
            'flash.message' => 'Pengguna berhasil diblokir.',
        ]);
    }

    /**
     * Unban the specified user.
     */
    public function unban(User $user)
    {
        if (! $user->is_banned) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Pengguna tidak sedang diblokir.',
            ]);
        }

        $user->update([
            'is_banned' => false,
        ]);

        return back()->with([
            'flash.type' => 'success',
            'flash.message' => 'Blokir pengguna berhasil dicabut.',
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Anda tidak dapat menghapus akun sendiri.',
            ]);
        }

        if ($user->is_admin) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' => 'Akun admin tidak dapat dihapus.',
            ]);
        }

        /*
         * Delete active sessions before deleting the user.
         */
        DB::table('sessions')
            ->where(
                'user_id',
                $user->id
            )
            ->delete();

        /*
         * user_details will automatically be deleted
         * because the foreign key uses cascadeOnDelete().
         */
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' => 'Pengguna berhasil dihapus.',
            ]);
    }
}
