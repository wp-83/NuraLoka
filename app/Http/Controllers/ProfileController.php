<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Badge;
use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use App\Services\ImageCompressionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Every image upload goes through this service so size, format and file
     * naming stay consistent across the application.
     */
    public function __construct(
        private readonly ImageCompressionService $images,
    ) {}

    /**
     * Show the profile page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $user->load(['userDetail.province', 'userDetail.level']);

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

        // Viewing your own profile redirects to the private profile page.
        if ($currentUser && $currentUser->username === $username) {
            return redirect()->route('profile.index');
        }

        $targetUser = User::where('username', $username)->firstOrFail();
        $targetUser->load(['userDetail.province', 'userDetail.level']);

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
        $allBadges = $targetUser->badges()->orderBy('pivot_created_at', 'desc')->get();

        $albums = Album::with(['trip', 'tripPhotos'])
            ->whereHas('trip', function ($q) use ($targetUser) {
                $q->where('user_id', $targetUser->id)
                    ->where('is_public', true);
            })
            ->orderByDesc('created_at')
            ->take(6)
            ->get()
            ->map(function ($album) {
                $firstPhoto = $album->tripPhotos->first();

                return [
                    'id' => $album->id,
                    'slug' => $album->slug,
                    'title' => $album->trip->title,
                    'location' => $album->trip->destination_name,
                    'date' => $album->trip->trip_date,
                    'thumbnail' => $firstPhoto ? $firstPhoto->photo_path : null,
                    'photo_count' => $album->tripPhotos->count(),
                ];
            });

        return inertia('Profile/Show', [
            'targetUser' => $targetUser,
            'rank' => $rank,
            'totalUser' => $totalUser,
            'totalBadge' => $totalBadges,
            'statistics' => $statistics,
            'recentBadges' => $recentBadges,
            'allBadges' => $allBadges,
            'albums' => $albums,
        ]);
    }

    /**
     * Show the profile edit page.
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
                'max:5120',
            ],
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',

            'username.unique' => 'Username tersebut sudah digunakan oleh pengguna lain.',

            'email.unique' => 'Email tersebut sudah digunakan oleh pengguna lain.',

            'profile_photo.max' => 'Ukuran maksimal Foto profil 5MB.',
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

            // The password changes only when the user supplies a new one.
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
                $path = $this->images->compressToDisk(
                    $request->file('profile_photo'),
                    'profile-photos',
                    maxWidth: 800,
                    maxHeight: 800,
                );

                // Remove the previous photo.
                if ($user->userDetail?->profile_path) {
                    Storage::disk('public')->delete(
                        $user->userDetail->profile_path
                    );
                }

                // Store the new path.
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
