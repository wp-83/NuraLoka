<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page with all saved places for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        // Get all saved places with categories for the current user
        $savedPlaces = $user->savedPlaces()->with('categories')->get();

        // Get the saved place IDs for bookmark state
        $savedPlaceIds = $savedPlaces->pluck('id')->toArray();

        // Count total saves per place (for "Ramai disimpan" text)
        $saveCounts = DB::table('saved_places')
            ->select('place_id', DB::raw('count(*) as total_saves'))
            ->whereIn('place_id', $savedPlaceIds)
            ->groupBy('place_id')
            ->pluck('total_saves', 'place_id')
            ->toArray();

        return inertia('Wishlist/Index', [
            'savedPlaces' => $savedPlaces,
            'savedPlaceIds' => $savedPlaceIds,
            'saveCounts' => $saveCounts,
        ]);
    }

    /**
     * Display detail page for a saved place.
     */
    public function show(string $slug)
    {
        $place = Place::with('categories')->where('slug', $slug)->firstOrFail();

        $isSaved = false;
        if (Auth::check()) {
            $isSaved = Auth::user()->savedPlaces()->where('place_id', $place->id)->exists();
        }

        // Count total saves
        $totalSaves = DB::table('saved_places')->where('place_id', $place->id)->count();

        return inertia('Wishlist/Show', [
            'place' => $place,
            'isSaved' => $isSaved,
            'totalSaves' => $totalSaves,
        ]);
    }

    /**
     * Toggle save/unsave a place for the authenticated user.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        $user = Auth::user();
        $placeId = $request->place_id;

        // Check if already saved
        $exists = $user->savedPlaces()->where('place_id', $placeId)->exists();

        if ($exists) {
            // Unsave
            $user->savedPlaces()->detach($placeId);
            $saved = false;
        } else {
            // Save
            $user->savedPlaces()->attach($placeId);
            $saved = true;
        }

        return back();
    }
}
