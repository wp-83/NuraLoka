<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Place;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AlbumController extends Controller
{
    /**
     * Halaman utama album (Gambar 1 + 5)
     * - Album populer minggu ini (publik, paling banyak views)
     * - Album milik user login
     * - Search user jika ada query 'search'
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
                        'profile_path' => $u->userDetails?->profile_path,
                    ];
                });
        }

        // Album populer minggu ini (publik, dari semua user, sorted by view_count, constraint seminggu)
        $popularAlbums = Album::with(['trip.user.userDetails', 'tripPhotos'])
            ->whereHas('trip', function ($q) {
                $q->where('is_public', true)
                    ->whereHas('user', function ($uq) {
                        $uq->where('is_banned', false);
                    });
            })
            ->where('created_at', '>=', now()->startOfWeek())
            ->orderByDesc('view_count')
            ->take(3)
            ->get()
            ->map(function ($album) {
                return $this->formatAlbumData($album);
            });

        // Album milik user login (max 6 untuk halaman index)
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

        // Total album milik user (untuk tombol lihat semua)
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
     * Detail album (Gambar 2)
     */
    public function show(Album $album)
    {
        $album->load(['trip.user.userDetails', 'tripPhotos']);

        $user = Auth::user();
        $isOwner = $album->trip->user_id === $user->id;

        // Increment view count hanya jika bukan pemilik
        if (! $isOwner) {
            $album->increment('view_count');
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
                'profile_path' => $album->trip->user->userDetails?->profile_path,
            ],
        ]);
    }

    /**
     * Halaman buat album baru
     */
    public function create()
    {
        return inertia('Album/Create');
    }

    /**
     * Simpan album baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'is_public' => 'boolean',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $user = Auth::user();

        // Buat trip sebagai basis album
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
            $manager = new ImageManager(new Driver);
            foreach ($request->file('photos') as $photo) {
                $image = $manager->decodePath($photo->getPathname());
                $image->scaleDown(width: 1200);
                $encoded = $image->encodeUsingFileExtension('webp', quality: 80);

                $filename = uniqid('album_', true).'.webp';
                $path = 'album-photos/'.$filename;

                Storage::disk('public')->put($path, $encoded->toString());

                TripPhoto::create([
                    'album_id' => $album->id,
                    'place_id' => null,
                    'photo_path' => $path,
                ]);
            }
        }

        return redirect()->route('album.index')->with('success', 'Album berhasil dibuat!');
    }

    /**
     * Halaman edit album (Gambar 3)
     */
    public function edit(Album $album)
    {
        $user = Auth::user();
        $album->load(['trip', 'tripPhotos']);

        // Pastikan hanya pemilik yang bisa edit
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
     * Update data album (dari Gambar 3)
     */
    public function update(Request $request, Album $album)
    {
        $user = Auth::user();
        $album->load('trip');

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
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

        return redirect()->route('album.index')->with('success', 'Album berhasil diperbarui!');
    }

    /**
     * Hapus album
     */
    public function destroy(Album $album)
    {
        $user = Auth::user();
        $album->load(['trip', 'tripPhotos']);

        if ($album->trip->user_id !== $user->id) {
            abort(403);
        }

        // Hapus foto-foto dari storage
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
     * Album milik user tertentu (dari Gambar 5 → klik Lihat Album)
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
     * Tambah foto ke album
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
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240', // Max 10MB sebelum kompresi
        ]);

        $manager = new ImageManager(new Driver);

        foreach ($request->file('photos') as $photo) {
            // Baca gambar
            $image = $manager->decodePath($photo->getPathname());

            // Perkecil gambar jika terlalu besar (maksimal lebar 1200px), proporsi dijaga otomatis
            $image->scaleDown(width: 1200);

            // Encode ke format WebP dengan kualitas 80% (bagus dan ringan)
            $encoded = $image->encodeUsingFileExtension('webp', quality: 80);

            // Buat nama file unik
            $filename = uniqid('album_', true).'.webp';
            $path = 'album-photos/'.$filename;

            // Simpan file hasil kompresi ke storage
            Storage::disk('public')->put($path, $encoded->toString());

            TripPhoto::create([
                'album_id' => $album->id,
                'place_id' => null,
                'photo_path' => $path,
            ]);
        }

        return back()->with('success', 'Foto berhasil ditambahkan!');
    }

    /**
     * Hapus foto dari album
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
     * Format album data untuk frontend
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
            'date' => $trip->trip_date,
            'is_public' => (bool) $trip->is_public,
            'view_count' => $album->view_count,
            'caption' => $album->caption,
            'thumbnail' => $firstPhoto?->photo_path,
            'photo_count' => $album->tripPhotos->count(),
            'user_id' => $trip->user_id,
            'author_name' => $trip->user?->userDetails?->fullname ?? $trip->user?->username ?? '-',
            'author_profile' => $trip->user?->userDetails?->profile_path,
        ];
    }

    /**
     * Cari lokasi (untuk autocomplete)
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
