<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumView;
use App\Models\Place;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\User;
use App\Services\AlbumPresenter;
use App\Services\GamificationService;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * Everything a user does with their own albums: browsing, creating, editing,
 * and adding or removing photos.
 *
 * Two collaborators carry the work that is not specific to one action:
 * AlbumPresenter decides what an album looks like to the frontend, and
 * AlbumPolicy decides who may touch it (see App\Policies\AlbumPolicy).
 */
class AlbumController extends Controller
{
    /**
     * Size limit for ONE album photo before compression, in kilobytes (10 MB).
     * Shared by the create-album form and the add-photo form on the edit page so
     * the two upload paths can never disagree on the limit.
     */
    public const PHOTO_MAX_KB = 10240;

    /** Albums shown on the index page before the "see all" button takes over. */
    private const INDEX_ALBUM_LIMIT = 6;

    /** Popular albums featured at the top of the index page. */
    private const POPULAR_ALBUM_LIMIT = 3;

    public function __construct(
        // Every image upload goes through this service so size, format and file
        // naming stay consistent across the application.
        private readonly ImageCompressionService $images,
        private readonly AlbumPresenter $presenter,
        private readonly GamificationService $gamification,
    ) {}

    /**
     * Album index page:
     * - this week's popular albums (public, most viewed);
     * - albums owned by the signed-in user;
     * - user search results when a 'search' query is present.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search');

        $popularAlbums = Album::withCardData()
            ->popularThisWeek()
            ->take(self::POPULAR_ALBUM_LIMIT)
            ->get();

        $myAlbums = Album::withCardData()
            ->ownedBy($user->id)
            ->newestFirst()
            ->take(self::INDEX_ALBUM_LIMIT)
            ->get();

        return inertia('Album/Index', [
            'popularAlbums' => $this->presenter->cards($popularAlbums),
            'myAlbums' => $this->presenter->cards($myAlbums),
            // The full count drives the "see all" button, which is why it is not
            // simply $myAlbums->count().
            'totalMyAlbums' => Album::ownedBy($user->id)->count(),
            'searchResults' => $search ? $this->searchUsers($search, $user) : null,
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
            'album' => $this->presenter->card($album),
            'photos' => $this->presenter->photos($album),
            'isOwner' => $isOwner,
            'author' => [
                'fullname' => $album->trip->user->userDetails?->fullname
                    ?? $album->trip->user->username,
                // Ready-made URL plus a gender-appropriate default avatar, the
                // same one used by the navbar, the leaderboard and the profile.
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
     * Store a new album, together with the trip that carries its metadata.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'place_id' => 'nullable|integer|exists:places,id',
            'date' => 'required|date',
            'is_public' => 'boolean',
            'photos' => 'nullable|array',
            'photos.*' => $this->photoRules(),
        ], $this->photoMessages());

        $user = Auth::user();

        // A trip is the basis of every album. An album created by hand has no
        // real route, so the origin is left blank and only the destination —
        // the location the user typed — is filled in.
        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'origin_name' => '-',
            'origin_latitude' => 0,
            'origin_longitude' => 0,
            'destination_name' => $validated['location'],
            'destination_latitude' => 0,
            'destination_longitude' => 0,
            'trip_date' => $validated['date'],
            'is_public' => $validated['is_public'] ?? true,
        ]);

        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $validated['title'],
            'view_count' => 0,
        ]);

        $this->storePhotos($request, $album, $validated['place_id'] ?? null);

        // Gamification: record the album-creation action (no category filter),
        // then auto-detect tiered badges from this album's photos and the
        // categories of the place they are tagged with.
        $this->gamification->record($user, 'create_album');
        $this->gamification->syncAlbumBadges($user);

        return redirect()->route('album.index')->with($this->flash('success', 'Album berhasil dibuat!'));
    }

    /**
     * Album edit form.
     */
    public function edit(Album $album)
    {
        $album->load(['trip.user.userDetails', 'tripPhotos']);

        $this->authorize('update', $album);

        return inertia('Album/Edit', [
            'album' => $this->presenter->card($album),
            'photos' => $this->presenter->photos($album),
        ]);
    }

    /**
     * Update an album's metadata.
     */
    public function update(Request $request, Album $album)
    {
        $album->load('trip');

        $this->authorize('update', $album);

        // A system album (the two-point journey): its title, location and date
        // are generated and must not be edited. Rejected server-side because the
        // frontend hiding the fields is not a guarantee.
        if ($album->trip->is_system) {
            return redirect()
                ->route('album.show', $album->slug)
                ->with($this->flash(
                    'error',
                    'Album perjalanan dibuat otomatis oleh sistem — hanya foto yang dapat diubah.',
                ));
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'place_id' => 'nullable|integer|exists:places,id',
            'date' => 'required|date',
            'is_public' => 'boolean',
        ]);

        $album->trip->update([
            'title' => $validated['title'],
            'destination_name' => $validated['location'],
            'trip_date' => $validated['date'],
            'is_public' => $validated['is_public'] ?? $album->trip->is_public,
        ]);

        $this->syncTitle($album, $validated['title']);

        if ($request->has('place_id')) {
            // Every photo in an album is tagged with the same place, so the tag
            // is applied to all of them at once.
            TripPhoto::where('album_id', $album->id)
                ->update(['place_id' => $validated['place_id'] ?? null]);

            $this->gamification->syncAlbumBadges(Auth::user());
        }

        return redirect()->route('album.index')->with($this->flash('success', 'Album berhasil diperbarui!'));
    }

    /**
     * Delete an album and the photo files behind it.
     */
    public function destroy(Album $album)
    {
        $album->load(['trip', 'tripPhotos']);

        $this->authorize('delete', $album);

        foreach ($album->tripPhotos as $photo) {
            $this->deletePhotoFile($photo);
            $photo->delete();
        }

        $album->delete();

        return redirect()->route('album.index')->with($this->flash('success', 'Album berhasil dihapus!'));
    }

    /**
     * Every album owned by the signed-in user.
     */
    public function allAlbums()
    {
        $albums = Album::withCardData()
            ->ownedBy(Auth::id())
            ->newestFirst()
            ->get();

        return inertia('Album/All', [
            'albums' => $this->presenter->cards($albums),
            'pageTitle' => 'Semua Album Kamu',
            'ownerName' => null,
        ]);
    }

    /**
     * The PUBLIC albums of another user.
     */
    public function userAlbums($userId)
    {
        $targetUser = User::with('userDetails')->findOrFail($userId);

        // A banned user's profile behaves as if it does not exist.
        if ($targetUser->is_banned) {
            abort(404);
        }

        $albums = Album::withCardData()
            ->ownedBy($targetUser->id)
            ->public()
            ->newestFirst()
            ->get();

        $fullname = $targetUser->userDetails?->fullname ?? $targetUser->username;

        return inertia('Album/All', [
            'albums' => $this->presenter->cards($albums),
            'pageTitle' => "Menampilkan album {$fullname}",
            'ownerName' => $fullname,
        ]);
    }

    /**
     * Flip an album between public and private.
     */
    public function toggleVisibility(Album $album)
    {
        $album->load('trip');

        $this->authorize('update', $album);

        $album->trip->update([
            'is_public' => ! $album->trip->is_public,
        ]);

        // Confirmed explicitly: this switch decides whether the album's photos
        // appear on place pages across the site, and it is worth telling the
        // user which way it just went.
        return back()->with($this->flash(
            'success',
            $album->trip->is_public
                ? 'Album kini publik — fotonya bisa muncul di halaman tempat.'
                : 'Album kini privat — fotonya disembunyikan dari halaman tempat.',
        ));
    }

    /**
     * Add photos to an existing album.
     */
    public function addPhoto(Request $request, Album $album)
    {
        $album->load(['trip', 'tripPhotos']);

        $this->authorize('update', $album);

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => $this->photoRules(),
        ], $this->photoMessages());

        // New photos inherit the album's place tag; request('place_id') only
        // applies to an album that has no photo to inherit from yet.
        $placeId = $album->tripPhotos->first()->place_id ?? $request->input('place_id');

        $this->storePhotos($request, $album, $placeId);

        // New photos may push the user over a badge tier they had not reached.
        $this->gamification->syncAlbumBadges(Auth::user());

        return back()->with($this->flash('success', 'Foto berhasil ditambahkan!'));
    }

    /**
     * Delete a single photo from an album.
     */
    public function removePhoto($photoId)
    {
        $photo = TripPhoto::with('album.trip')->findOrFail($photoId);

        $this->authorize('update', $photo->album);

        $this->deletePhotoFile($photo);
        $photo->delete();

        return back()->with($this->flash('success', 'Foto berhasil dihapus!'));
    }

    /**
     * Place search, used by the location autocomplete on the album forms.
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

    /**
     * Users matching a name, for the search box on the album index.
     *
     * Admins, banned accounts and the searcher themselves are left out.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function searchUsers(string $search, User $searcher)
    {
        return User::query()
            ->whereHas('userDetails', fn ($q) => $q->where('fullname', 'like', "%{$search}%"))
            ->with(['userDetails.province'])
            ->where('id', '!=', $searcher->id)
            ->where('is_admin', false)
            ->where('is_banned', false)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'fullname' => $user->userDetails?->fullname ?? $user->username,
                'province' => $user->userDetails?->province?->name ?? '-',
                // A ready-made profile photo URL (see
                // User::getPublicProfilePhotoAttribute), not a raw path. That
                // accessor also picks a gender-appropriate default avatar;
                // sending a raw path here would make users without a photo look
                // different from the profile page and the leaderboard.
                'profile_path' => $user->public_profile_photo,
            ]);
    }

    /**
     * Compress every uploaded file and attach it to the album.
     */
    private function storePhotos(Request $request, Album $album, ?int $placeId): void
    {
        if (! $request->hasFile('photos')) {
            return;
        }

        foreach ($request->file('photos') as $photo) {
            TripPhoto::create([
                'album_id' => $album->id,
                'place_id' => $placeId,
                'photo_path' => $this->images->compressToDisk($photo, 'album-photos'),
            ]);
        }
    }

    /**
     * Carry a renamed title from the trip over to the album row.
     *
     * The album title lives on the trip, so updating the trip alone never
     * touches the album: its caption and slug would keep the old title. Done
     * only when the title actually changed, so the album URL stays put when the
     * user edits just the location or the date.
     */
    private function syncTitle(Album $album, string $title): void
    {
        if (! $album->trip->wasChanged('title')) {
            return;
        }

        $album->setRelation('trip', $album->trip->fresh());
        $album->caption = $title;

        // Clearing the slug marks the row dirty so the updating event really
        // fires; HasSlug then regenerates it from the title.
        $album->slug = null;
        $album->save();
    }

    /** Remove a photo's file from disk, if it is still there. */
    private function deletePhotoFile(TripPhoto $photo): void
    {
        if ($photo->photo_path && Storage::disk('public')->exists($photo->photo_path)) {
            Storage::disk('public')->delete($photo->photo_path);
        }
    }

    /** Validation rules for a single album photo file. */
    private function photoRules(): string
    {
        return 'image|mimes:jpeg,png,jpg,webp|max:'.self::PHOTO_MAX_KB;
    }

    /**
     * Upload error messages, taken from the album.php lang file so they follow
     * the user's locale instead of Laravel's generic validation wording.
     *
     * @return array<string, string>
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
}
