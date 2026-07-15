<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

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
            ->when(
                $request->search,
                function ($query, $search) {
                    $query->where(
                        function ($query) use ($search) {
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
                        }
                    );
                }
            )
            ->when(
                $request->role,
                function ($query, $role) {
                    $query->where(
                        'is_admin',
                        $role === 'admin'
                    );
                }
            )
            ->when(
                $request->gender,
                function ($query, $gender) {
                    $query->whereHas(
                        'userDetail',
                        function ($query) use ($gender) {
                            $query->where(
                                'gender',
                                $gender
                            );
                        }
                    );
                }
            )
            ->when(
                $request->status,
                function ($query, $status) {
                    $query->where(
                        'is_banned',
                        $status === 'banned'
                    );
                }
            )
            ->orderByRaw(
                'CASE WHEN users.id = ? THEN 0 ELSE 1 END',
                [
                    Auth::id(),
                ]
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
                    'total_users' =>
                        User::count(),

                    'total_regular_users' =>
                        User::where(
                            'is_admin',
                            false
                        )->count(),

                    'total_admins' =>
                        User::where(
                            'is_admin',
                            true
                        )->count(),

                    'total_banned_users' =>
                        User::where(
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
        $validated = $request->validate(
            [
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

                'profile_photo' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048',
                ],
            ],
            [
                'password.regex' =>
                    'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',

                'username.unique' =>
                    'Username tersebut sudah digunakan oleh pengguna lain.',

                'email.unique' =>
                    'Email tersebut sudah digunakan oleh pengguna lain.',

                'profile_photo.max' =>
                    'Ukuran maksimal foto profil 2MB.',
            ]
        );

        DB::transaction(
            function () use (
                $request,
                $validated
            ) {
                /*
                |--------------------------------------------------------------------------
                | Create User
                |--------------------------------------------------------------------------
                */

                $user = User::create([
                    'username' =>
                        $validated['username'],

                    'email' =>
                        $validated['email'],

                    'password' =>
                        Hash::make(
                            $validated['password']
                        ),

                    'is_admin' =>
                        $validated['is_admin'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | Prepare User Detail
                |--------------------------------------------------------------------------
                */

                $userDetailData = [
                    'fullname' =>
                        $validated['fullname'],

                    'dob' =>
                        $validated['dob'],

                    'gender' =>
                        $validated['gender'],

                    'province_id' =>
                        $validated['province_id'],
                ];

                /*
                |--------------------------------------------------------------------------
                | Store Profile Photo
                |--------------------------------------------------------------------------
                */

                $profilePath =
                    $this->storeProfilePhoto(
                        $request
                    );

                if ($profilePath) {
                    $userDetailData[
                        'profile_path'
                    ] = $profilePath;
                }

                /*
                |--------------------------------------------------------------------------
                | Create User Detail
                |--------------------------------------------------------------------------
                */

                $user
                    ->userDetail()
                    ->create(
                        $userDetailData
                    );
            }
        );

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' =>
                    'Pengguna baru berhasil ditambahkan.',
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
        $validated = $request->validate(
            [
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

                'profile_photo' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048',
                ],
            ],
            [
                'password.regex' =>
                    'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',

                'username.unique' =>
                    'Username tersebut sudah digunakan oleh pengguna lain.',

                'email.unique' =>
                    'Email tersebut sudah digunakan oleh pengguna lain.',

                'profile_photo.max' =>
                    'Ukuran maksimal foto profil 2MB.',
            ]
        );

        DB::transaction(
            function () use (
                $request,
                $user,
                $validated
            ) {
                /*
                |--------------------------------------------------------------------------
                | Update User
                |--------------------------------------------------------------------------
                */

                $userData = [
                    'username' =>
                        $validated['username'],

                    'email' =>
                        $validated['email'],
                ];

                /*
                 * Akun sendiri tidak dapat
                 * mengubah role-nya.
                 */
                if ($user->id !== Auth::id()) {
                    $userData['is_admin'] =
                        $validated['is_admin'];
                }

                /*
                 * Password hanya diubah
                 * jika password baru diisi.
                 */
                if (
                    ! empty(
                        $validated['password']
                    )
                ) {
                    $userData['password'] =
                        Hash::make(
                            $validated['password']
                        );
                }

                $user->update(
                    $userData
                );

                /*
                |--------------------------------------------------------------------------
                | Prepare User Detail
                |--------------------------------------------------------------------------
                */

                $userDetailData = [
                    'fullname' =>
                        $validated['fullname'],

                    'dob' =>
                        $validated['dob'],

                    'gender' =>
                        $validated['gender'],

                    'province_id' =>
                        $validated['province_id'],
                ];

                /*
                |--------------------------------------------------------------------------
                | Update Profile Photo
                |--------------------------------------------------------------------------
                */

                if (
                    $request->hasFile(
                        'profile_photo'
                    )
                ) {
                    $oldProfilePath =
                        $user
                            ->userDetail
                            ?->profile_path;

                    $profilePath =
                        $this->storeProfilePhoto(
                            $request
                        );

                    $userDetailData[
                        'profile_path'
                    ] = $profilePath;

                    /*
                     * Hapus foto lama setelah
                     * foto baru berhasil disimpan.
                     */
                    if ($oldProfilePath) {
                        Storage::disk(
                            'public'
                        )->delete(
                            $oldProfilePath
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Update User Detail
                |--------------------------------------------------------------------------
                */

                $user
                    ->userDetail()
                    ->updateOrCreate(
                        [
                            'user_id' =>
                                $user->id,
                        ],
                        $userDetailData
                    );
            }
        );

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' =>
                    'Data pengguna berhasil diperbarui.',
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
                'flash.message' =>
                    'Anda tidak dapat memblokir akun sendiri.',
            ]);
        }

        if ($user->is_admin) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' =>
                    'Akun admin tidak dapat diblokir.',
            ]);
        }

        if ($user->is_banned) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' =>
                    'Pengguna sudah diblokir.',
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
            'flash.message' =>
                'Pengguna berhasil diblokir.',
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
                'flash.message' =>
                    'Pengguna tidak sedang diblokir.',
            ]);
        }

        $user->update([
            'is_banned' => false,
        ]);

        return back()->with([
            'flash.type' => 'success',
            'flash.message' =>
                'Blokir pengguna berhasil dicabut.',
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
                'flash.message' =>
                    'Anda tidak dapat menghapus akun sendiri.',
            ]);
        }

        if ($user->is_admin) {
            return back()->with([
                'flash.type' => 'error',
                'flash.message' =>
                    'Akun admin tidak dapat dihapus.',
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
         * Delete profile photo from storage.
         */
        if (
            $user
                ->userDetail
                ?->profile_path
        ) {
            Storage::disk('public')
                ->delete(
                    $user
                        ->userDetail
                        ->profile_path
                );
        }

        /*
         * user_details will automatically be deleted
         * because the foreign key uses cascadeOnDelete().
         */
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' =>
                    'Pengguna berhasil dihapus.',
            ]);
    }

    /**
     * Store and compress the uploaded profile photo.
     */
    private function storeProfilePhoto(
        Request $request
    ): ?string {
        if (
            ! $request->hasFile(
                'profile_photo'
            )
        ) {
            return null;
        }

        $photo =
            $request->file(
                'profile_photo'
            );

        /*
        |--------------------------------------------------------------------------
        | Create Image Manager
        |--------------------------------------------------------------------------
        */

        $manager = new ImageManager(
            new Driver
        );

        /*
        |--------------------------------------------------------------------------
        | Read Image
        |--------------------------------------------------------------------------
        */

        $image = $manager->decodePath(
            $photo->getPathname()
        );

        /*
        |--------------------------------------------------------------------------
        | Resize Image
        |--------------------------------------------------------------------------
        */

        $image->scaleDown(
            width: 800,
            height: 800
        );

        /*
        |--------------------------------------------------------------------------
        | Convert to WebP
        |--------------------------------------------------------------------------
        */

        $encoded =
            $image->encodeUsingFileExtension(
                'webp',
                quality: 80
            );

        /*
        |--------------------------------------------------------------------------
        | Generate Unique Filename
        |--------------------------------------------------------------------------
        */

        $filename =
            uniqid(
                'profile_',
                true
            ).'.webp';

        $path =
            'profile-photos/'.
            $filename;

        /*
        |--------------------------------------------------------------------------
        | Store Image
        |--------------------------------------------------------------------------
        */

        Storage::disk('public')->put(
            $path,
            $encoded->toString()
        );

        return $path;
    }
}
