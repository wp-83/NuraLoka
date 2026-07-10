<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PlaceController extends Controller
{
    /**
     * Display a listing of the resource for user.
     */
    public function index(Request $request)
    {
        $query = Place::with('categories');

        // Search filter - search in name dan description
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category') && ! empty($request->category)) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category);
            });
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $places = $query->get();

        return Inertia::render('Explore/Index', [
            'places' => $places,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Display a listing of the resource for admin.
     */
    public function admin()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $place = Place::with('categories')->where('slug', $slug)->firstOrFail();

        $isSaved = false;
        if (auth()->check()) {
            $isSaved = auth()->user()->savedPlaces()->where('place_id', $place->id)->exists();
        }

        $totalSaves = DB::table('saved_places')->where('place_id', $place->id)->count();

        return Inertia::render('Place/Show', [
            'place' => $place,
            'isSaved' => $isSaved,
            'totalSaves' => $totalSaves,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
