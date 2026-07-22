<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Services\GamificationService;
use App\Services\PlaceDetailPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * The user's wishlist ("Impian"): the places they have saved.
 */
class WishlistController extends Controller
{
    public function __construct(
        private readonly PlaceDetailPresenter $placeDetail,
        private readonly GamificationService $gamification,
    ) {}

    /**
     * The wishlist page: every place the signed-in user has saved.
     */
    public function index()
    {
        $user = Auth::user();

        // photos and publicTripPhotos are eager-loaded for the card cover image
        // (the img accessor), then 'img' is appended so it reaches the frontend.
        // Only the PUBLIC trip photos: a place saved here must not expose a
        // photo from an album its owner has made private.
        $savedPlaces = $user->savedPlaces()
            ->with(['categories', 'photos', 'publicTripPhotos'])
            ->get()
            ->each(fn (Place $place) => $place->append('img'));

        $savedPlaceIds = $savedPlaces->pluck('id')->toArray();

        // How many people saved each place, for the "frequently saved" label.
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
     * Detail page for a saved place.
     *
     * Built by the same presenter as the Explore detail page, so the two show
     * an identical gallery, visitor count, album count and price.
     */
    public function show(string $slug)
    {
        $place = Place::with(['categories', 'photos'])->where('slug', $slug)->firstOrFail();

        return inertia(
            'Wishlist/Show',
            $this->placeDetail->props($place, Auth::user()),
        );
    }

    /**
     * Save or unsave a place.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        $user = Auth::user();
        $placeId = $request->place_id;

        if ($user->savedPlaces()->where('place_id', $placeId)->exists()) {
            $user->savedPlaces()->detach($placeId);

            return back()->with($this->flash('success', 'Tempat dihapus dari Daftar Impian.'));
        }

        $user->savedPlaces()->attach($placeId);

        // Gamification: record the save, filtered by the place's categories.
        $this->gamification->record($user, 'save_place', Place::find($placeId));

        return back()->with($this->flash('success', 'Tempat disimpan ke Daftar Impian.'));
    }
}
