<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Services\GamificationService;
use App\Services\PlaceDetailPresenter;
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

        // photos and tripPhotos are eager-loaded for the card cover image (the img
        // accessor), then 'img' is appended so it reaches the frontend.
        $savedPlaces = $user->savedPlaces()
            ->with(['categories', 'photos', 'tripPhotos'])
            ->get()
            ->each(fn (Place $place) => $place->append('img'));

        // Get the saved place IDs for bookmark state
        $savedPlaceIds = $savedPlaces->pluck('id')->toArray();

        // Total saves per place, for the "frequently saved" label.
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
        $place = Place::with(['categories', 'photos'])->where('slug', $slug)->firstOrFail();

        // The SAME data source as the detail page under Explore, so both pages show
        // an identical gallery, visitor count, album count and price. This page used
        // to send only place/isSaved/totalSaves, so its gallery just repeated a
        // single image eight times.
        return inertia(
            'Wishlist/Show',
            app(PlaceDetailPresenter::class)->props($place, Auth::user()),
        );
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

            // Gamification: record the save action, filtered by the place's categories.
            app(GamificationService::class)->record($user, 'save_place', Place::find($placeId));
        }

        return back();
    }
}
