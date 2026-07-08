<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil semua places beserta kategorinya
        $places = Place::with('categories')->get();

        // 2. Ambil semua kategori untuk filter
        $categories = Category::all();

        // 3. Trending Places: ambil 10 tempat yang paling banyak di-save di tabel `saved_places`
        // Karena saved_places memiliki place_id, kita bisa fetch place-nya.
        $trendingPlaceIds = DB::table('saved_places')
            ->select('place_id', DB::raw('count(*) as total_saves'))
            ->groupBy('place_id')
            ->orderByDesc('total_saves')
            ->limit(10)
            ->pluck('place_id')
            ->toArray();

        // Ambil data place-nya, tapi urutkan sesuai dengan order $trendingPlaceIds
        $trendingPlaces = collect();
        if (! empty($trendingPlaceIds)) {
            $idsOrdered = implode(',', $trendingPlaceIds);
            $trendingPlaces = Place::with('categories')
                ->whereIn('id', $trendingPlaceIds)
                ->orderByRaw("FIELD(id, $idsOrdered)")
                ->get();
        }

        // 4. Recently Visited: ambil array place_id dari session, misal maksimal 5
        $recentlyVisitedIds = $request->session()->get('recently_visited_places', []);

        $recentlyVisited = collect();
        if (! empty($recentlyVisitedIds)) {
            $idsOrdered = implode(',', $recentlyVisitedIds);
            $recentlyVisited = Place::with('categories')
                ->whereIn('id', $recentlyVisitedIds)
                ->orderByRaw("FIELD(id, $idsOrdered)")
                ->get();
        }

        // 5. Saved Place IDs: untuk state bookmark pada PlaceCard
        $savedPlaceIds = [];
        if (auth()->check()) {
            $savedPlaceIds = auth()->user()->savedPlaces()->pluck('places.id')->toArray();
        }

        return inertia('Explore/Index', [
            'places' => $places,
            'categories' => $categories,
            'trendingPlaces' => $trendingPlaces,
            'recentlyVisited' => $recentlyVisited,
            'savedPlaceIds' => $savedPlaceIds,
        ]);
    }

    public function trackVisit(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        $placeId = $request->place_id;

        // Ambil array dari session
        $recent = $request->session()->get('recently_visited_places', []);

        // Hapus jika sudah ada (agar bisa dipindah ke paling depan)
        if (($key = array_search($placeId, $recent)) !== false) {
            unset($recent[$key]);
        }

        // Tambah ke paling depan (paling baru)
        array_unshift($recent, $placeId);

        // Batasi maksimal 5 atau 10 tempat
        $recent = array_slice($recent, 0, 5);

        // Simpan kembali ke session
        $request->session()->put('recently_visited_places', $recent);

        return redirect()->back();
    }
}
