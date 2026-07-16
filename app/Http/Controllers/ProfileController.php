<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman profil.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $user->load('userDetail.province');

        $userDetail = $user->userDetail;

        $totalUser = User::count();

        $totalBadges = Badge::count();

        $rank = UserDetail::where(
            'total_points',
            '>',
            $userDetail->total_points
        )
            ->orWhere(function ($query) use ($userDetail) {
                $query
                    ->where(
                        'total_points',
                        $userDetail->total_points
                    )
                    ->where(
                        'fullname',
                        '<',
                        $userDetail->fullname
                    );
            })
            ->count() + 1;

        $statistics = [
            'badges' => $user->badges()->count(),
            'albums' => $user->albums()->count(),
        ];

        $recentBadges = $user->badges()->orderBy('pivot_created_at', 'desc')->take(4)->get();

        return inertia('Profile/Index', [
            'user' => $user,
            'rank' => $rank,
            'totalUser' => $totalUser,
            'totalBadge' => $totalBadges,
            'statistics' => $statistics,
            'recentBadges' => $recentBadges,
        ]);
    }

    /**
     * Menampilkan profil publik user lain.
     */
    public function show($username)
    {
        $currentUser = auth()->user();

        // Jika user melihat profil sendiri, redirect ke halaman profil pribadi
        if ($currentUser && $currentUser->username === $username) {
            return redirect()->route('profile.index');
        }

        $targetUser = User::where('username', $username)->firstOrFail();
        $targetUser->load('userDetail.province');

        $userDetail = $targetUser->userDetail;

        $totalUser = User::count();

        $totalBadges = Badge::count();

        $rank = UserDetail::where(
            'total_points',
            '>',
            $userDetail->total_points
        )
            ->orWhere(function ($query) use ($userDetail) {
                $query
                    ->where(
                        'total_points',
                        $userDetail->total_points
                    )
                    ->where(
                        'fullname',
                        '<',
                        $userDetail->fullname
                    );
            })
            ->count() + 1;

        $statistics = [
            'badges' => $targetUser->badges()->count(),
            'albums' => $targetUser->albums()->count(),
        ];

        $recentBadges = $targetUser->badges()->orderBy('pivot_created_at', 'desc')->take(4)->get();

        return inertia('Profile/Show', [
            'targetUser' => $targetUser,
            'rank' => $rank,
            'totalUser' => $totalUser,
            'totalBadge' => $totalBadges,
            'statistics' => $statistics,
            'recentBadges' => $recentBadges,
        ]);
    }

    /**
     * Menampilkan halaman edit profil.
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        $user->load('userDetail.province');

        $provinces = Province::select('id', 'name')
            ->orderBy('name')
            ->get();

        return inertia('Profile/Edit', [
            'user' => $user,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Memperbarui data profil.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | User
            |--------------------------------------------------------------------------
            */

            'username' => [
                'required',
                'string',
                'lowercase',
                'max:40',
                Rule::unique('users', 'username')
                    ->ignore($user->id),
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'password' => [
                'nullable',
                'string',
                'min:10',
                'max:50',
                'regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/',
                'confirmed',
            ],

            /*
            |--------------------------------------------------------------------------
            | User Detail
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Profile Photo
            |--------------------------------------------------------------------------
            */

            'profile_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',

            'username.unique' => 'Username tersebut sudah digunakan oleh pengguna lain.',

            'email.unique' => 'Email tersebut sudah digunakan oleh pengguna lain.',

            'profile_photo.max' => 'Ukuran maksimal Foto profil 2MB.',
        ]);

        DB::transaction(function () use (
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
                'username' => $validated['username'],
                'email' => $validated['email'],
            ];

            // Password hanya diubah jika user mengisi password baru.
            if (! empty($validated['password'])) {
                $userData['password'] = $validated['password'];
            }

            $user->update($userData);

            /*
            |--------------------------------------------------------------------------
            | Update User Detail
            |--------------------------------------------------------------------------
            */

            $userDetailData = [
                'fullname' => $validated['fullname'],
                'dob' => $validated['dob'],
                'gender' => $validated['gender'],
                'province_id' => $validated['province_id'],
            ];

            /*
            |--------------------------------------------------------------------------
            | Compress and Update Profile Photo
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('profile_photo')) {
                $photo = $request->file('profile_photo');

                // Buat image manager menggunakan GD.
                $manager = new ImageManager(
                    new Driver
                );

                // Baca gambar.
                $image = $manager->decodePath(
                    $photo->getPathname()
                );

                // Perkecil gambar tanpa merusak aspect ratio.
                $image->scaleDown(
                    width: 800,
                    height: 800
                );

                // Konversi dan kompres ke WebP.
                $encoded = $image->encodeUsingFileExtension(
                    'webp',
                    quality: 80
                );

                // Buat nama file unik.
                $filename = uniqid(
                    'profile_',
                    true
                ).'.webp';

                $path = 'profile-photos/'.$filename;

                // Simpan foto baru.
                Storage::disk('public')->put(
                    $path,
                    $encoded->toString()
                );

                // Hapus foto lama.
                if ($user->userDetail?->profile_path) {
                    Storage::disk('public')->delete(
                        $user->userDetail->profile_path
                    );
                }

                // Simpan path baru ke database.
                $userDetailData['profile_path'] = $path;
            }

            /*
            |--------------------------------------------------------------------------
            | Save User Detail
            |--------------------------------------------------------------------------
            */

            $user->userDetail()->updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                $userDetailData
            );
        });

        return redirect()
            ->route('profile.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' => 'Data profil berhasil diperbarui.',
            ]);
    }
}
