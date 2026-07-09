<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPlaceController extends Controller
{
    /**
     * Display a listing of places for admin dashboard.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Place::with('categories');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $places = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Place/Index', [
            'places' => $places,
            'filters' => [
                'search' => $search,
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
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'address'     => 'required|string|max:500',
            'categories'  => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
        ]);

        $place = Place::create([
            'name'        => $request->name,
            'description' => $request->description,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'address'     => $request->address,
        ]);

        // Sync categories
        if ($request->has('categories')) {
            $place->categories()->sync($request->categories);
        }

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil ditambahkan!');

        return redirect()->route('admin.places.index');
    }

    /**
     * Show the form for editing the specified place.
     */
    public function edit(string $id)
    {
        $place = Place::with('categories')->findOrFail($id);
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Place/Edit', [
            'place'      => $place,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified place in database.
     */
    public function update(Request $request, string $id)
    {
        $place = Place::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'address'     => 'required|string|max:500',
            'categories'  => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
        ]);

        $place->update([
            'name'        => $request->name,
            'description' => $request->description,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'address'     => $request->address,
        ]);

        // Sync categories (detach old, attach new)
        $place->categories()->sync($request->categories ?? []);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil diperbarui!');

        return redirect()->route('admin.places.index');
    }

    /**
     * Remove the specified place from database.
     */
    public function destroy(string $id)
    {
        $place = Place::findOrFail($id);

        // Detach all categories before deleting
        $place->categories()->detach();
        $place->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Destinasi wisata berhasil dihapus!');

        return redirect()->route('admin.places.index');
    }
}
