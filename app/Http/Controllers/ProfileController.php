<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Badge;
use App\Models\Province;
use App\Models\User;
use App\Models\UserDetail;
use App\Services\AlbumPresenter;
use App\Services\ImageCompressionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * The user's own profile, the public profile of someone else, and the form that
 * edits the former.
 *
 * The private and the public page show the same summary — rank, badge and album
 * counts, recent badges — so both build it through profileSummary().
 */
class ProfileController extends Controller
{
    /** Badges shown in the "recently earned" strip. */
    private const RECENT_BADGE_LIMIT = 4;

    /** Albums shown on someone else's public profile. */
    private const PROFILE_ALBUM_LIMIT = 6;

    public function __construct(
        // Every image upload goes through this service so size, format and file
        // naming stay consistent across the application.
        private readonly ImageCompressionService $images,
        private readonly AlbumPresenter $albums,
    ) {}

    /**
     * The signed-in user's own profile.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load(['userDetail.province', 'userDetail.level']);

        return inertia('Profile/Index', [
            'user' => $user,
            ...$this->profileSummary($user),
        ]);
    }

    /**
     * Someone else's public profile.
     */
    public function show($username)
    {
        $currentUser = auth()->user();

        // Viewing your own profile redirects to the private profile page, which
        // is the one with the edit controls.
        if ($currentUser && $currentUser->username === $username) {
            return redirect()->route('profile.index');
        }

        $targetUser = User::where('username', $username)->firstOrFail();
        $targetUser->load(['userDetail.province', 'userDetail.level']);

        // Only PUBLIC albums: a visitor must not see what the owner has hidden.
        $albums = Album::withCardData()
            ->ownedBy($targetUser->id)
            ->public()
            ->newestFirst()
            ->take(self::PROFILE_ALBUM_LIMIT)
            ->get();

        return inertia('Profile/Show', [
            'targetUser' => $targetUser,
            ...$this->profileSummary($targetUser),
            'allBadges' => $this->badgesByNewest($targetUser)->get(),
            'albums' => $this->albums->cards($albums),
        ]);
    }

    /**
     * Show the profile edit page.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        $user->load('userDetail.province');

        return inertia('Profile/Edit', [
            'user' => $user,
            'provinces' => Province::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the profile: account fields, profile fields and the photo, all in
     * one transaction so a failure halfway cannot leave the two rows disagreeing.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            // Account
            'username' => [
                'required',
                'string',
                'lowercase',
                'max:40',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => [
                'nullable',
                'string',
                'min:10',
                'max:50',
                'regex:/^(?=.*[A-Z])(?=.*[!@#$%])[A-Za-z0-9!@#$%]+$/',
                'confirmed',
            ],

            // Profile
            'fullname' => ['required', 'string', 'max:255'],
            'dob' => ['required', 'date'],
            'gender' => ['required', Rule::in(['male', 'female', 'unspecified'])],
            'province_id' => ['required', 'exists:provinces,id'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'password.regex' => 'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 simbol di antara !,@,#,$,%.',
            'username.unique' => 'Username tersebut sudah digunakan oleh pengguna lain.',
            'email.unique' => 'Email tersebut sudah digunakan oleh pengguna lain.',
            'profile_photo.max' => 'Ukuran maksimal Foto profil 5MB.',
        ]);

        DB::transaction(function () use ($request, $user, $validated) {
            $account = [
                'username' => $validated['username'],
                'email' => $validated['email'],
            ];

            // The password changes only when the user supplies a new one.
            if (! empty($validated['password'])) {
                $account['password'] = $validated['password'];
            }

            $user->update($account);

            $profile = [
                'fullname' => $validated['fullname'],
                'dob' => $validated['dob'],
                'gender' => $validated['gender'],
                'province_id' => $validated['province_id'],
            ];

            if ($request->hasFile('profile_photo')) {
                $profile['profile_path'] = $this->replaceProfilePhoto($request, $user);
            }

            $user->userDetail()->updateOrCreate(['user_id' => $user->id], $profile);
        });

        return redirect()
            ->route('profile.index')
            ->with([
                'flash.type' => 'success',
                'flash.message' => 'Data profil berhasil diperbarui.',
            ]);
    }

    /**
     * The stats block both profile pages render.
     *
     * @return array<string, mixed>
     */
    private function profileSummary(User $user): array
    {
        return [
            'rank' => UserDetail::rankOf($user->userDetail),
            'totalUser' => User::count(),
            'totalBadge' => Badge::count(),
            'statistics' => [
                'badges' => $user->badges()->count(),
                'albums' => $user->albums()->count(),
            ],
            'recentBadges' => $this->badgesByNewest($user)
                ->take(self::RECENT_BADGE_LIMIT)
                ->get(),
        ];
    }

    /** A user's badges, most recently earned first. */
    private function badgesByNewest(User $user)
    {
        return $user->badges()->orderByDesc('pivot_created_at');
    }

    /**
     * Compress and store the new profile photo, then drop the old file.
     *
     * @return string the stored path
     */
    private function replaceProfilePhoto(Request $request, User $user): string
    {
        $path = $this->images->compressToDisk(
            $request->file('profile_photo'),
            'profile-photos',
            maxWidth: 800,
            maxHeight: 800,
        );

        if ($user->userDetail?->profile_path) {
            Storage::disk('public')->delete($user->userDetail->profile_path);
        }

        return $path;
    }
}
