<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\OsmPlace;
use App\Models\Place;
use App\Models\PlaceVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    // Titik OSM sangat padat → hanya ditampilkan mulai zoom ini agar tidak menumpuk.
    // Place admin (kurasi, jumlahnya sedikit) TIDAK digate → selalu tampil.
    private const OSM_MIN_ZOOM = 14;

    // Batas jumlah titik per response agar payload tetap ringan.
    private const POINT_CAP = 1500;

    // Bobot skor "Ramai Dikunjungi": pengunjung > pemosting album > saves.
    private const WEIGHT_VISIT = 3;

    private const WEIGHT_ALBUM = 2;

    private const WEIGHT_SAVE = 1;

    // Radius maksimal (meter) agar check-in dianggap sah (verifikasi lokasi).
    private const CHECKIN_RADIUS_M = 300;

    /**
     * Endpoint peta: GET /jelajah/titik?south=&west=&north=&east=&zoom=&categories=
     *
     * Menggabungkan titik admin (tabel places) + titik OSM (tabel osm_places):
     *  - Place ADMIN → SELALU tampil (jumlahnya sedikit & tersebar, tidak menumpuk).
     *  - Titik OSM   → hanya saat zoom >= OSM_MIN_ZOOM (padat → cegah menumpuk).
     */
    public function points(Request $request)
    {
        $v = $request->validate([
            'south' => 'required|numeric',
            'west' => 'required|numeric',
            'north' => 'required|numeric',
            'east' => 'required|numeric',
            'zoom' => 'required|integer|min:0|max:22',
            'categories' => 'nullable|string',
        ]);

        $zoom = (int) $v['zoom'];
        $south = (float) $v['south'];
        $west = (float) $v['west'];
        $north = (float) $v['north'];
        $east = (float) $v['east'];
        $categories = array_values(array_filter(array_map('trim', explode(',', $v['categories'] ?? ''))));

        // Place admin: selalu ditampilkan di semua zoom.
        $points = $this->adminPoints($south, $west, $north, $east, $categories);

        // OSM: hanya saat zoom cukup dekat.
        if ($zoom >= self::OSM_MIN_ZOOM) {
            $points = $points->concat($this->osmPoints($south, $west, $north, $east, $categories));
        }

        return response()->json(['points' => $points->values()]);
    }

    /** Titik place admin (tabel places) di dalam viewport. */
    private function adminPoints(float $south, float $west, float $north, float $east, array $categories)
    {
        return Place::with('categories')
            ->whereBetween('latitude', [$south, $north])
            ->whereBetween('longitude', [$west, $east])
            ->when($categories, fn ($q) => $q->whereHas('categories', fn ($c) => $c->whereIn('name', $categories)))
            ->limit(self::POINT_CAP)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'source' => 'admin',
                'name' => $p->name,
                'slug' => $p->slug,
                'latitude' => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'address' => $p->address,
                'categories' => $p->categories->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values(),
            ]);
    }

    /** Titik OSM (tabel osm_places) di dalam viewport. */
    private function osmPoints(float $south, float $west, float $north, float $east, array $categories)
    {
        return OsmPlace::query()
            ->whereBetween('latitude', [$south, $north])
            ->whereBetween('longitude', [$west, $east])
            ->when($categories, fn ($q) => $q->whereIn('category', $categories))
            ->limit(self::POINT_CAP)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->osm_id,
                'osmId' => $p->osm_id,
                'source' => 'osm',
                'name' => $p->name,
                'latitude' => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'address' => $p->address,
                'category' => $p->category,
                'subtype' => $p->subtype,
            ]);
    }

    public function index(Request $request)
    {
        // 1. Ambil semua places beserta kategorinya
        $places = Place::with('categories')->get();

        // 2. Ambil semua kategori untuk filter
        $categories = Category::all();

        // 3. Trending Places ("Ramai Dikunjungi") — skor berbobot dari data realtime:
        //    pengunjung (check-in) ×3 + pemosting album unik ×2 + saves ×1.
        //    Semua dihitung langsung dari DB tiap request (tidak di-cache).
        $trendingPlaces = $this->trendingPlaces(10);

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

    public function show(string $slug)
    {
        $place = Place::with('categories')->where('slug', $slug)->firstOrFail();

        $isSaved = false;
        if (auth()->check()) {
            $isSaved = auth()->user()->savedPlaces()->where('place_id', $place->id)->exists();
        }

        $totalSaves = DB::table('saved_places')->where('place_id', $place->id)->count();

        return inertia('Explore/Show', [
            'place' => $place,
            'isSaved' => $isSaved,
            'totalSaves' => $totalSaves,
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

    /**
     * Check-in: rekam kunjungan bila lokasi user (dari Geolocation browser) berada
     * dalam radius CHECKIN_RADIUS_M dari koordinat place. 1 kunjungan unik per user/place.
     */
    public function checkIn(Request $request)
    {
        $data = $request->validate([
            'place_id' => 'required|exists:places,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $place = Place::findOrFail($data['place_id']);

        $distance = $this->haversineMeters(
            (float) $data['latitude'], (float) $data['longitude'],
            (float) $place->latitude, (float) $place->longitude
        );

        if ($distance > self::CHECKIN_RADIUS_M) {
            return response()->json([
                'ok' => false,
                'distance' => round($distance),
                'message' => 'Kamu masih ~'.round($distance).' m dari lokasi. Mendekatlah (≤ '.self::CHECKIN_RADIUS_M.' m) untuk check-in.',
            ], 422);
        }

        // updateOrCreate → unik per (user, place); check-in ulang hanya memperbarui waktu.
        PlaceVisit::updateOrCreate(
            ['user_id' => auth()->id(), 'place_id' => $place->id],
            ['latitude' => $data['latitude'], 'longitude' => $data['longitude'], 'visited_at' => now()]
        );

        return response()->json([
            'ok' => true,
            'message' => 'Berhasil check-in di '.$place->name.'!',
        ]);
    }

    /**
     * Ambil top-N place berdasarkan skor "ramai": pengunjung unik, pemosting album unik,
     * dan jumlah saves — masing-masing diberi bobot. Dihitung live dari DB.
     */
    private function trendingPlaces(int $limit)
    {
        // Ekspresi skor dipakai untuk ORDER BY. Bobot berupa konstanta int (aman diinterpolasi).
        $scoreSql =
            '((SELECT COUNT(*) FROM place_visits WHERE place_visits.place_id = places.id) * '.self::WEIGHT_VISIT.') + '
            .'((SELECT COUNT(DISTINCT trips.user_id) FROM trip_photos '
            .'JOIN albums ON albums.id = trip_photos.album_id '
            .'JOIN trips ON trips.id = albums.trip_id '
            .'WHERE trip_photos.place_id = places.id) * '.self::WEIGHT_ALBUM.') + '
            .'((SELECT COUNT(*) FROM saved_places WHERE saved_places.place_id = places.id) * '.self::WEIGHT_SAVE.')';

        return Place::with('categories')
            ->select('places.*')
            ->selectRaw("$scoreSql as trending_score")
            ->selectSub(
                DB::table('place_visits')->selectRaw('COUNT(*)')->whereColumn('place_visits.place_id', 'places.id'),
                'visitors_count'
            )
            ->selectSub(
                DB::table('trip_photos')
                    ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
                    ->join('trips', 'trips.id', '=', 'albums.trip_id')
                    ->selectRaw('COUNT(DISTINCT trips.user_id)')
                    ->whereColumn('trip_photos.place_id', 'places.id'),
                'album_posters_count'
            )
            ->selectSub(
                DB::table('saved_places')->selectRaw('COUNT(*)')->whereColumn('saved_places.place_id', 'places.id'),
                'saves_count'
            )
            ->orderByDesc('trending_score')
            ->limit($limit)
            ->get()
            // Sembunyikan place tanpa aktivitas (skor 0) agar section benar-benar "ramai".
            ->filter(fn ($p) => (int) $p->trending_score > 0)
            ->values();
    }

    private function haversineMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371000; // radius bumi (meter)
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earth * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
