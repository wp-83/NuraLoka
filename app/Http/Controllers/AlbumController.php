<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumView;
use App\Models\Place;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AlbumController extends Controller
{
    /**
     * Batas ukuran SATU foto album sebelum dikompres, dalam kilobyte (10 MB).
     * Dipakai bersama oleh form buat album dan tambah foto di halaman ubah,
     * supaya batasnya tidak pernah berbeda antar dua jalur unggah.
     */
    public const PHOTO_MAX_KB = 10240;

    /**
     * Every image upload goes through this service so size, format and file
     * naming stay consistent across the application.
     */
    public function __construct(
        private readonly ImageCompressionService $images,
    ) {}

    /** Aturan validasi untuk satu berkas foto album. */
    private function photoRules(): string
    {
        return 'image|mimes:jpeg,png,jpg,webp|max:'.self::PHOTO_MAX_KB;
    }

    /**
     * Pesan error unggah foto — diambil dari berkas lang album.php supaya bahasanya
     * mengikuti locale user, bukan pesan validasi bawaan Laravel yang generik.
     */
    private function photoMessages(): array
    {
        $max = ['max' => self::PHOTO_MAX_KB / 1024];

        return [
            'photos.required' => __('album.photo_error_required'),
            'photos.*.image' => __('album.photo_error_type'),
            'photos.*.mimes' => __('album.photo_error_type'),
            'photos.*.max' => __('album.photo_error_size', $max),
            'photos.*.uploaded' => __('album.photo_error_size', $max),
        ];
    }

    /**
     * Album index page.
     * - This week's popular albums (public, most viewed)
     * - Albums owned by the signed-in user
     * - User search when a 'search' query is present
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search');

        // Search users by name
        $searchResults = null;
        if ($search) {
            $searchResults = User::whereHas('userDetails', function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%");
            })
                ->with(['userDetails.province'])
                ->where('id', '!=', $user->id)
                ->where('is_admin', false)
                ->where('is_banned', false)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'fullname' => $u->userDetails?->fullname ?? $u->username,
                        'province' => $u->userDetails?->province?->name ?? '-',
                        // A ready-made profile photo URL (see
                        // User::getPublicProfilePhotoAttribute), not a raw path.
                        // That accessor also picks a gender-appropriate default
                        // avatar; sending a raw path here would make users
                        // without a photo look different from the profile page
                        // and the leaderboard.
                        'profile_path' => $u->public_profile_photo,
                    ];
                });
        }

        // This week's popular albums: public albums ranked by the views they got
        // in the last 7 days (see Album::scopePopularThisWeek).
        $popularAlbums = Album::with(['trip.user.userDetails', 'tripPhotos'])
            ->popularThisWeek()
            ->take(3)
            ->get()
            ->map(function ($album) {
                return $this->formatAlbumData($album);
            });

        // Albums owned by the signed-in user (max 6 on the index page).
        $myAlbums = Album::with(['trip', 'tripPhotos'])
            ->whereHas('trip', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('created_at')
            ->take(6)
            ->get()
            ->map(function ($album) {
                return $this->formatAlbumData($album);
            });

        // Total albums owned by the user, for the "see all" button.
        $totalMyAlbums = Album::whereHas('trip', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        return inertia('Album/Index', [
            'popularAlbums' => $popularAlbums,
            'myAlbums' => $myAlbums,
            'totalMyAlbums' => $totalMyAlbums,
            'searchResults' => $searchResults,
            'searchQuery' => $search ?? '',
        ]);
    }

    /**
     * Album detail page.
     */
    public function show(Album $album)
    {
        $album->load(['trip.user.userDetails', 'tripPhotos']);

        $user = Auth::user();
        $isOwner = $album->trip->user_id === $user->id;

        // Only count a view when the viewer is not the owner. The lifetime total
        // lives on albums.view_count; the timestamped row in album_views is what
        // makes the weekly ranking possible.
        if (! $isOwner) {
            $album->increment('view_count');

            AlbumView::create([
                'album_id' => $album->id,
                'user_id' => $user->id,
                'viewed_at' => now(),
            ]);
        }

        return inertia('Album/Show', [
            'album' => $this->formatAlbumData($album),
            'photos' => $album->tripPhotos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'photo_path' => $photo->photo_path,
                    'filename' => basename($photo->photo_path),
                ];
            }),
            'isOwner' => $isOwner,
            'author' => [
                'fullname' => $album->trip->user->userDetails?->fullname ?? $album->trip->user->username,
                // Ready-made URL plus a gender-appropriate default avatar, the same
                // one used by the navbar, the leaderboard and the profile page.
                'profile_path' => $album->trip->user->public_profile_photo,
            ],
        ]);
    }

    /**
     * New album form.
     */
    public function create()
    {
        return inertia('Album/Create');
    }

    /**
     * Store a new album.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'place_id' => 'nullable|integer|exists:places,id',
            'date' => 'required|date',
            'is_public' => 'boolean',
            'photos' => 'nullable|array',
            'photos.*' => $this->photoRules(),
        ], $this->photoMessages());

        $user = Auth::user();

        // A trip is the basis of every album.
        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => $request->location,
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => $request->date,
            'is_public' => $request->is_public ?? true,
        ]);

        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $request->title,
            'view_count' => 0,
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $this->images->compressToDisk($photo, 'album-photos');

                TripPhoto::create([
                    'album_id' => $album->id,
                    'place_id' => $request->place_id,
                    'photo_path' => $path,
                ]);
            }
        }

        // Gamification: record the album-creation action (no category filter), then
        // auto-detect tiered badges from this album's photos and place categories.
        $gamification = app(GamificationService::class);
        $gamification->record($user, 'create_album');
        $gamification->syncAlbumBadges($user);

        return redirect()->route('album.index')->with('success', 'Album berhasil dibuat!');
    }

    /**
     * Album edit form.
     */
    public function edit(Album $album)
    {
        $user = Auth::user();
        $album->load(['trip', 'tripPhotos']);

        // Only the owner may edit.
        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        return inertia('Album/Edit', [
            'album' => $this->formatAlbumData($album),
            'photos' => $album->tripPhotos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'photo_path' => $photo->photo_path,
                    'filename' => basename($photo->photo_path),
                ];
            }),
        ]);
    }

    /**
     * Update an album.
     */
    public function update(Request $request, Album $album)
    {
        $user = Auth::user();
        $album->load('trip');

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        // Album sistem (perjalanan 2 titik): judul/lokasi/tanggal dibuat otomatis
        // and must not be edited. Reject the attempt server-side.
        if ($album->trip->is_system) {
            session()->flash('flash.type', 'error');
            session()->flash('flash.message', 'Album perjalanan dibuat otomatis oleh sistem — hanya foto yang dapat diubah.');

            return redirect()->route('album.show', $album->slug);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'place_id' => 'nullable|integer|exists:places,id',
            'date' => 'required|date',
            'is_public' => 'boolean',
        ]);

        // Update trip data
        $album->trip->update([
            'title' => $request->title,
            'destination_name' => $request->location,
            'trip_date' => $request->date,
            'is_public' => $request->is_public ?? $album->trip->is_public,
        ]);

        // The album title lives on the trip, so updating the trip alone never
        // touches the album row: caption and slug would keep the old title.
        // Done only when the title actually changes, so the album URL stays put
        // when the user edits just the location or the date.
        if ($album->trip->wasChanged('title')) {
            $album->setRelation('trip', $album->trip->fresh());
            $album->caption = $request->title;

            // Clearing the slug marks the row dirty so the updating event really
            // fires; HasSlug then regenerates it from the title.
            $album->slug = null;
            $album->save();
        }

        if ($request->has('place_id')) {
            TripPhoto::where('album_id', $album->id)->update(['place_id' => $request->place_id]);
            app(GamificationService::class)->syncAlbumBadges($user);
        }

        return redirect()->route('album.index')->with('success', 'Album berhasil diperbarui!');
    }

    /**
     * Delete an album.
     */
    public function destroy(Album $album)
    {
        $user = Auth::user();
        $album->load(['trip', 'tripPhotos']);

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        // Remove the photo files from storage.
        foreach ($album->tripPhotos as $photo) {
            if (Storage::disk('public')->exists($photo->photo_path)) {
                Storage::disk('public')->delete($photo->photo_path);
            }
            $photo->delete();
        }

        $album->delete();

        return redirect()->route('album.index')->with('success', 'Album berhasil dihapus!');
    }

    /**
     * Semua album user (Gambar 4)
     */
    public function allAlbums()
    {
        $user = Auth::user();

        $albums = Album::with(['trip', 'tripPhotos'])
            ->whereHas('trip', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($album) {
                return $this->formatAlbumData($album);
            });

        return inertia('Album/All', [
            'albums' => $albums,
            'pageTitle' => 'Semua Album Kamu',
            'ownerName' => null,
        ]);
    }

    /**
     * Albums belonging to a specific user.
     */
    public function userAlbums($userId)
    {
        $targetUser = User::with('userDetails')->findOrFail($userId);

        if ($targetUser->is_banned) {
            abort(404);
        }

        $albums = Album::with(['trip', 'tripPhotos'])
            ->whereHas('trip', function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->where('is_public', true);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($album) {
                return $this->formatAlbumData($album);
            });

        $fullname = $targetUser->userDetails?->fullname ?? $targetUser->username;

        return inertia('Album/All', [
            'albums' => $albums,
            'pageTitle' => "Menampilkan album {$fullname}",
            'ownerName' => $fullname,
        ]);
    }

    /**
     * Toggle visibilitas album (publik/privat)
     */
    public function toggleVisibility(Album $album)
    {
        $user = Auth::user();
        $album->load('trip');

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        $album->trip->update([
            'is_public' => ! $album->trip->is_public,
        ]);

        return back();
    }

    /**
     * Add photos to an album.
     */
    public function addPhoto(Request $request, Album $album)
    {
        $user = Auth::user();
        $album->load('trip');

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => $this->photoRules(), // maks 10MB per foto sebelum kompresi
        ], $this->photoMessages());

        foreach ($request->file('photos') as $photo) {
            // Sama seperti saat album dibuat: setiap foto dikompres ke WebP,
            // bukan disimpan mentah.
            $path = $this->images->compressToDisk($photo, 'album-photos');

            TripPhoto::create([
                'album_id' => $album->id,
                'place_id' => $album->tripPhotos->first()->place_id ?? request('place_id'),
                'photo_path' => $path,
            ]);
        }

        // New photos may push the user over a badge tier they had not reached yet.
        app(GamificationService::class)->syncAlbumBadges($user);

        return back()->with('success', 'Foto berhasil ditambahkan!');
    }

    /**
     * Delete a photo from an album.
     */
    public function removePhoto($photoId)
    {
        $user = Auth::user();
        $photo = TripPhoto::with('album.trip')->findOrFail($photoId);

        if ($photo->album->trip->user_id !== $user->id) {
            abort(403);
        }

        if (Storage::disk('public')->exists($photo->photo_path)) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $photo->delete();

        return back()->with('success', 'Foto berhasil dihapus!');
    }

    /**
     * Shape album data for the frontend.
     */
    private function formatAlbumData(Album $album): array
    {
        $trip = $album->trip;
        $firstPhoto = $album->tripPhotos->first();

        return [
            'id' => $album->id,
            'slug' => $album->slug,
            'title' => $trip->title,
            'location' => $trip->destination_name,
            'place_id' => $firstPhoto?->place_id,
            'date' => $trip->trip_date,
            'is_public' => (bool) $trip->is_public,
            'is_system' => (bool) $trip->is_system,
            'view_count' => $album->view_count,
            // Hanya terisi kalau query-nya lewat Album::scopePopularThisWeek.
            'weekly_views' => isset($album->weekly_views) ? (int) $album->weekly_views : null,
            'caption' => $album->caption,
            'thumbnail' => $firstPhoto?->photo_path,
            'photo_count' => $album->tripPhotos->count(),
            'user_id' => $trip->user_id,
            'author_name' => $trip->user?->userDetails?->fullname ?? $trip->user?->username ?? '-',
            'author_profile' => $trip->user?->public_profile_photo,
        ];
    }

    /**
     * Location search, used for autocomplete.
     */
    public function searchLocation(Request $request)
    {
        $query = $request->query('q');

        if (! $query) {
            return response()->json([]);
        }

        $places = Place::where('name', 'like', "%{$query}%")
            ->orWhere('address', 'like', "%{$query}%")
            ->select('id', 'name', 'address')
            ->limit(5)
            ->get();

        return response()->json($places);
    }
}
