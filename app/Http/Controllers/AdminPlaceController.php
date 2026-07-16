<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Photo;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AdminPlaceController extends Controller
{
    /**
     * Display a listing of places for admin dashboard.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $source = $request->input('source'); // 'internal' | 'osm' | null (semua)

        $query = Place::with('categories');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan asal data (kolom internal admin-only).
        if (in_array($source, ['internal', 'osm'], true)) {
            $query->where('source', $source);
        }

        $places = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Place/Index', [
            'places' => $places,
            'filters' => [
                'search' => $search,
                'source' => $source,
            ],
        ]);
    }

    /**
     * Show the form for creating a new place.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Place/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created place in database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $place = Place::create([
            'name' => $request->name,
            'description' => $request->description,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            // Tempat yang dibuat admin NuraLoka selalu bersumber 'internal'.
            'source' => 'internal',
        ]);

        // Sync categories
        if ($request->has('categories')) {
            $place->categories()->sync($request->categories);
        }

        $this->storeUploadedPhotos($request, $place);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil ditambahkan!');

        return redirect()->route('admin.places.index');
    }

    /**
     * Show the form for editing the specified place.
     */
    public function edit(string $id)
    {
        $place = Place::with(['categories', 'photos'])->findOrFail($id);
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Place/Edit', [
            'place' => $place,
            'categories' => $categories,
            'photos' => $place->photos->map(fn ($ph) => [
                'id' => $ph->id,
                'url' => '/storage/'.$ph->path,
            ])->values(),
        ]);
    }

    /**
     * Update the specified place in database.
     */
    public function update(Request $request, string $id)
    {
        $place = Place::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240',
            'deleted_photos' => 'nullable|array',
            'deleted_photos.*' => 'integer',
        ]);

        $place->update([
            'name' => $request->name,
            'description' => $request->description,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
        ]);

        // Sync categories (detach old, attach new)
        $place->categories()->sync($request->categories ?? []);

        // Hapus foto yang ditandai untuk dihapus (hanya foto milik place ini).
        if ($request->filled('deleted_photos')) {
            $this->deletePhotos($place, $request->deleted_photos);
        }

        $this->storeUploadedPhotos($request, $place);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil diperbarui!');

        return redirect()->route('admin.places.index');
    }

    /**
     * Remove the specified place from database.
     */
    public function destroy(string $id)
    {
        $place = Place::with('photos')->findOrFail($id);

        // Hapus file foto yang tidak lagi dipakai place lain, lalu detach.
        $this->deletePhotos($place, $place->photos->pluck('id')->all());

        // Detach all categories before deleting
        $place->categories()->detach();
        $place->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil dihapus!');

        return redirect()->route('admin.places.index');
    }

    /**
     * Kompres & simpan foto yang diunggah admin ke disk publik, buat record Photo,
     * lalu tautkan ke place lewat pivot photo_place.
     */
    private function storeUploadedPhotos(Request $request, Place $place): void
    {
        if (! $request->hasFile('photos')) {
            return;
        }

        $manager = new ImageManager(new Driver);

        foreach ($request->file('photos') as $file) {
            $image = $manager->decodePath($file->getPathname());
            $image->scaleDown(width: 1600);
            $encoded = $image->encodeUsingFileExtension('webp', quality: 80);

            $path = 'place-photos/'.uniqid('place_', true).'.webp';
            Storage::disk('public')->put($path, $encoded->toString());

            $photo = Photo::create([
                'path' => $path,
                'uploaded_by' => auth()->id(),
            ]);

            $place->photos()->attach($photo->id);
        }
    }

    /**
     * Lepas tautan foto dari place. Jika foto tidak lagi dipakai place mana pun,
     * hapus record & filenya agar storage tidak menumpuk.
     */
    private function deletePhotos(Place $place, array $photoIds): void
    {
        $photos = $place->photos()->whereIn('photos.id', $photoIds)->get();

        foreach ($photos as $photo) {
            $place->photos()->detach($photo->id);

            if ($photo->places()->count() === 0) {
                if (Storage::disk('public')->exists($photo->path)) {
                    Storage::disk('public')->delete($photo->path);
                }
                $photo->delete();
            }
        }
    }
}
