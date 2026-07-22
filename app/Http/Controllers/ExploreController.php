<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Category;
use App\Models\Place;
use App\Models\PlaceVisit;
use App\Models\Trip;
use App\Services\GamificationService;
use App\Services\PlaceDetailPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    // Maximum number of points sent per zoom level (level-of-detail, like Google Maps).
    // Points appear GRADUALLY: few when zoomed out, more as you zoom in, so the map
    // never fills up all at once. Applies EQUALLY to internal and OSM places (they
    // are one kind of point). Below the smallest zoom here, no points are returned.
    private const ZOOM_BUDGET = [
        16 => 1500,
        15 => 400,
        14 => 200,
        13 => 90,
        12 => 40,
        11 => 18,
    ];

    // Scoring weights for "Trending Places": visitors > album posters > saves.
    private const WEIGHT_VISIT = 3;

    private const WEIGHT_ALBUM = 2;

    private const WEIGHT_SAVE = 1;

    // Maximum distance (metres) for a check-in to count as valid (location proof).
    private const CHECKIN_RADIUS_M = 300;

    // Minimum separation (metres) between the two points of a journey. Origin and
    // destination must differ: a journey with no distance is not a journey, its
    // route is empty, and its album ends up titled "Trip X -> X".
    //
    // A distance threshold is used rather than an exact coordinate comparison,
    // because one and the same place can appear several times in Nominatim's
    // results with coordinates a few metres apart. 25 m is still far tighter than
    // the gap between genuinely different places.
    private const JOURNEY_MIN_SEPARATION_M = 25;

    // Default radius (km) for the "Trending Places" section: only places near the
    // signed-in user. Places far from them are not recommended.
    private const TRENDING_RADIUS_KM = 100;

    /**
     * Map endpoint: GET /jelajah/titik?south=&west=&north=&east=&zoom=&categories=
     *
     * Reads from a SINGLE source (the places table); every point is treated alike.
     * Density is controlled by level-of-detail: the number of points is capped per
     * zoom and prioritised (curated internal places and the most popular first) so
     * the "important" ones appear early and the rest follow as you zoom in.
     * 'source' is never sent to the client.
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
        $budget = $this->pointBudget($zoom);

        // Still zoomed too far out, so no points yet (clean map).
        if ($budget <= 0) {
            return response()->json(['points' => []]);
        }

        $south = (float) $v['south'];
        $west = (float) $v['west'];
        $north = (float) $v['north'];
        $east = (float) $v['east'];
        $categories = array_values(array_filter(array_map('trim', explode(',', $v['categories'] ?? ''))));

        $points = Place::with('categories:id,name,icon_path')
            ->withCount('visits')
            ->whereBetween('latitude', [$south, $north])
            ->whereBetween('longitude', [$west, $east])
            ->when($categories, fn ($q) => $q->whereHas('categories', fn ($c) => $c->whereIn('name', $categories)))
            // Display priority: curated internal places first, then the most visited.
            ->orderByRaw("FIELD(source, 'internal', 'osm')")
            ->orderByDesc('visits_count')
            ->orderBy('id')
            ->limit($budget)
            ->get()
            ->map(fn ($p) => $this->mapPoint($p));

        return response()->json(['points' => $points->values()]);
    }

    /** Point budget for a given zoom level (progressive level-of-detail). */
    private function pointBudget(int $zoom): int
    {
        foreach (self::ZOOM_BUDGET as $minZoom => $cap) {
            if ($zoom >= $minZoom) {
                return $cap;
            }
        }

        return 0;
    }

    /** Uniform shape of a single map point for the client (never exposes source). */
    private function mapPoint(Place $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'latitude' => (float) $p->latitude,
            'longitude' => (float) $p->longitude,
            'address' => $p->address,
            'categories' => $p->categories
                ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'icon_path' => $c->icon_path])
                ->values(),
        ];
    }

    /**
     * Autocomplete suggestion endpoint: GET /jelajah/cari?q=
     *
     * Reads from one source (the places table). Only a compact set of fields is
     * returned rather than whole rows, keeping the payload small and not exposing
     * where the data came from.
     */
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        // Require at least 2 characters so a single letter cannot scan the whole table.
        if (mb_strlen($q) < 2) {
            return response()->json(['suggestions' => []]);
        }

        // Build a FULLTEXT boolean expression: each word becomes a prefix (word*) and
        // boolean operators are stripped for safety. FULLTEXT needs tokens of at
        // least ft_min_token_size (3 by default), so short queries fall back to LIKE.
        $like = '%'.$q.'%';
        $tokens = collect(preg_split('/\s+/', $q, -1, PREG_SPLIT_NO_EMPTY))
            ->map(fn ($t) => preg_replace('/[+\-><()~*"@]/', '', $t))
            ->filter(fn ($t) => mb_strlen($t) >= 3);
        $useFulltext = $tokens->isNotEmpty();
        $boolean = $tokens->map(fn ($t) => $t.'*')->implode(' ');

        $nameFilter = function ($builder) use ($useFulltext, $boolean, $like) {
            if ($useFulltext) {
                $builder->whereFullText('name', $boolean, ['mode' => 'boolean']);
            } else {
                $builder->where('name', 'like', $like);
            }
        };

        $suggestions = Place::with('categories:id,name,icon_path')
            ->where($nameFilter)
            // Prefer curated (internal) places over OSM results.
            ->orderByRaw("FIELD(source, 'internal', 'osm')")
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'placeId' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'address' => $p->address,
                'latitude' => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'categories' => $p->categories
                    ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'icon_path' => $c->icon_path])
                    ->values(),
            ]);

        return response()->json(['suggestions' => $suggestions->values()]);
    }

    public function index(Request $request)
    {
        // 1. Points used only to compute the map's initial centre. Curated (internal)
        //    places are enough, keeping the payload small even when the places table
        //    holds thousands of OSM points.
        $places = Place::where('source', 'internal')
            ->get(['id', 'latitude', 'longitude']);

        // 2. All categories for the filter bar (including icon_path from the database).
        $categories = Category::all();

        // 3. Trending Places, scored from live data:
        //    visitors (check-ins) x3 + unique album posters x2 + saves x1.
        //    Computed straight from the database on every request (not cached).
        //    This list is the GLOBAL fallback, used when the visitor denies or
        //    cannot provide location. When location is available the frontend calls
        //    trending() instead, which limits results to a radius around them.
        $trendingPlaces = $this->trendingPlaces(10);

        // 4. Recently visited: place_id list from the session, capped at 5.
        $recentlyVisitedIds = $request->session()->get('recently_visited_places', []);

        $recentlyVisited = collect();
        if (! empty($recentlyVisitedIds)) {
            $idsOrdered = implode(',', $recentlyVisitedIds);
            $recentlyVisited = Place::with('categories')
                ->whereIn('id', $recentlyVisitedIds)
                ->orderByRaw("FIELD(id, $idsOrdered)")
                ->get();
        }

        // 5. Saved place ids, used for the bookmark state on PlaceCard.
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
            // Demo mode: animation only, no location check. false = real location check.
            'journeyDemoMode' => (bool) config('nuraloka.journey_demo_mode'),
        ]);
    }

    // NARROW corridor (metres) for mandatory via-points: only places genuinely on
    // the path are forced into the OSRM route, so it barely detours. Deliberately far
    // stricter than the "near the route" marker radius used by the frontend.
    private const ROUTE_VIA_CORRIDOR_M = 800;

    // Minimum spacing (metres) between via-points so they spread out instead of clustering.
    private const ROUTE_MIN_SPACING_M = 1500;

    // Cap on mandatory via-points. Deliberately low: the more points the route is
    // forced through, the more turns and detours it takes.
    private const ROUTE_MAX_VIA = 3;

    // Maximum distance (metres) from an OSM point to the actual route line for it to
    // count as "on the path" and qualify as a fallback via-point (used by the two-pass
    // snap endpoint). Kept small so detouring to it adds almost no turns.
    private const ROUTE_SNAP_M = 300;

    /**
     * Endpoint: GET /jelajah/rute-titik — mandatory via-points for building an OSRM route.
     *
     * ONLY admin-curated places (source=internal) that sit genuinely close to the path
     * (the narrow ROUTE_VIA_CORRIDOR_M corridor), capped at ROUTE_MAX_VIA, so the route
     * does not zigzag. OSM points are DELIBERATELY not forced into the route; the
     * frontend simply shows them as "near the route" markers through the normal map
     * point system. With no admin place on the path the waypoint list is empty, so the
     * route stays the natural A-to-B line while OSM points remain visible.
     */
    public function routeWaypoints(Request $request)
    {
        $v = $request->validate([
            'origin_lat' => 'required|numeric|between:-90,90',
            'origin_lng' => 'required|numeric|between:-180,180',
            'dest_lat' => 'required|numeric|between:-90,90',
            'dest_lng' => 'required|numeric|between:-180,180',
        ]);

        $oLat = (float) $v['origin_lat'];
        $oLng = (float) $v['origin_lng'];
        $dLat = (float) $v['dest_lat'];
        $dLng = (float) $v['dest_lng'];

        // A-to-B bounding box widened by the corridor width, used to prefilter in SQL.
        $latPad = self::ROUTE_VIA_CORRIDOR_M / 111320;
        $lngPad = self::ROUTE_VIA_CORRIDOR_M / (111320 * max(0.01, cos(deg2rad($oLat))));
        $bbox = [
            'south' => min($oLat, $dLat) - $latPad,
            'north' => max($oLat, $dLat) + $latPad,
            'west' => min($oLng, $dLng) - $lngPad,
            'east' => max($oLng, $dLng) + $lngPad,
        ];

        // Via-points: ONLY admin (internal) places inside the narrow corridor, ordered
        // along the A-to-B line. With an 800 m corridor and at most 3 points they are
        // near-collinear, so line order matches route order (no doubling back).
        $candidates = $this->corridorCandidates('internal', $bbox, $oLat, $oLng, $dLat, $dLng, self::ROUTE_VIA_CORRIDOR_M);

        // Thin out: skip points that sit too close to the previous via-point.
        $waypoints = [];
        foreach ($candidates as $p) {
            $last = end($waypoints);
            if ($last && $this->haversineMeters($last['latitude'], $last['longitude'], (float) $p->latitude, (float) $p->longitude) < self::ROUTE_MIN_SPACING_M) {
                continue;
            }
            // Same shape as a map point (slug + categories) so via-point markers render
            // identically: category icon and the "View detail" button both work.
            $waypoints[] = $this->mapPoint($p);
            if (count($waypoints) >= self::ROUTE_MAX_VIA) {
                break;
            }
        }

        return response()->json(['waypoints' => $waypoints]);
    }

    /**
     * Endpoint: POST /jelajah/rute-osm — fallback OSM via-points snapped to the real route.
     *
     * Used by the frontend ONLY when there are no admin via-points (two-pass): the
     * frontend first computes the natural A-to-B route and sends its geometry (`path`),
     * then this endpoint picks OSM points that genuinely hug that line (within
     * ROUTE_SNAP_M metres of the polyline), ordered along the route and capped. Because
     * those points already sit beside the road being driven, forcing the route through
     * them adds almost no turns.
     */
    public function routeOsmWaypoints(Request $request)
    {
        $v = $request->validate([
            'path' => 'required|array|min:2|max:400',
            'path.*' => 'array|size:2',
            'path.*.*' => 'required|numeric',
        ]);

        $path = $v['path']; // [[lat, lng], ...] geometri rute alami dari OSRM.

        // Local equirectangular projection centred on the path start, giving metres.
        $R = 6371000;
        $baseLat = (float) $path[0][0];
        $baseLng = (float) $path[0][1];
        $latRef = deg2rad($baseLat);
        $toXY = fn (float $lat, float $lng) => [
            deg2rad($lng - $baseLng) * cos($latRef) * $R,
            deg2rad($lat - $baseLat) * $R,
        ];

        // Precompute XY per path point plus cumulative length (for position along the route).
        $xy = [];
        $cum = [0.0];
        foreach ($path as $i => $pt) {
            $xy[$i] = $toXY((float) $pt[0], (float) $pt[1]);
            if ($i > 0) {
                $dx = $xy[$i][0] - $xy[$i - 1][0];
                $dy = $xy[$i][1] - $xy[$i - 1][1];
                $cum[$i] = $cum[$i - 1] + sqrt($dx * $dx + $dy * $dy);
            }
        }

        // Bounding box from the path extent plus the snap padding (SQL prefilter).
        $lats = array_map(fn ($p) => (float) $p[0], $path);
        $lngs = array_map(fn ($p) => (float) $p[1], $path);
        $latPad = self::ROUTE_SNAP_M / 111320;
        $lngPad = self::ROUTE_SNAP_M / (111320 * max(0.01, cos($latRef)));

        $candidates = Place::with('categories:id,name,icon_path')
            ->where('source', 'osm')
            ->whereBetween('latitude', [min($lats) - $latPad, max($lats) + $latPad])
            ->whereBetween('longitude', [min($lngs) - $lngPad, max($lngs) + $lngPad])
            ->get(['id', 'name', 'slug', 'latitude', 'longitude', 'address'])
            ->map(function ($p) use ($toXY, $xy, $cum) {
                [$dist, $arc] = $this->snapToPath($toXY, $xy, $cum, (float) $p->latitude, (float) $p->longitude);
                $p->snap_dist = $dist;
                $p->arc = $arc;

                return $p;
            })
            // Keep only points genuinely hugging the route line, ordered along it.
            ->filter(fn ($p) => $p->snap_dist <= self::ROUTE_SNAP_M)
            ->sortBy('arc')
            ->values();

        // Thin out and cap the count, same as for admin via-points.
        $waypoints = [];
        foreach ($candidates as $p) {
            $last = end($waypoints);
            if ($last && $this->haversineMeters($last['latitude'], $last['longitude'], (float) $p->latitude, (float) $p->longitude) < self::ROUTE_MIN_SPACING_M) {
                continue;
            }
            $waypoints[] = $this->mapPoint($p);
            if (count($waypoints) >= self::ROUTE_MAX_VIA) {
                break;
            }
        }

        return response()->json(['waypoints' => $waypoints]);
    }

    /**
     * Perpendicular distance (metres) from a point to the route polyline, plus its
     * position along that route (metres). Projects the point onto every segment and
     * keeps the nearest.
     *
     * @param  callable  $toXY  converts (lat,lng) to [x,y] in metres (local projection)
     * @param  array<int, array{0:float,1:float}>  $xy  XY of each path point
     * @param  array<int, float>  $cum  cumulative path length at each point
     * @return array{0:float, 1:float} [distance_metres, position_along_route_metres]
     */
    private function snapToPath(callable $toXY, array $xy, array $cum, float $pLat, float $pLng): array
    {
        [$px, $py] = $toXY($pLat, $pLng);
        $bestDist = INF;
        $bestArc = 0.0;
        $n = count($xy);

        for ($i = 1; $i < $n; $i++) {
            [$ax, $ay] = $xy[$i - 1];
            [$bx, $by] = $xy[$i];
            $dx = $bx - $ax;
            $dy = $by - $ay;
            $len2 = $dx * $dx + $dy * $dy;
            $t = $len2 > 0 ? max(0.0, min(1.0, (($px - $ax) * $dx + ($py - $ay) * $dy) / $len2)) : 0.0;
            $cx = $ax + $t * $dx;
            $cy = $ay + $t * $dy;
            $d = sqrt(($px - $cx) ** 2 + ($py - $cy) ** 2);
            if ($d < $bestDist) {
                $bestDist = $d;
                $bestArc = $cum[$i - 1] + $t * sqrt($len2);
            }
        }

        return [$bestDist, $bestArc];
    }

    /**
     * Via-point candidates from one $source ('internal'/'osm') along the route corridor:
     * prefiltered by the $bbox bounding box in SQL, projected onto the origin-to-
     * destination line, kept only when they fall between A and B and inside a corridor
     * $corridorM wide, then ordered along the line by t.
     *
     * @param  array{south:float,north:float,west:float,east:float}  $bbox
     */
    private function corridorCandidates(string $source, array $bbox, float $oLat, float $oLng, float $dLat, float $dLng, float $corridorM)
    {
        return Place::with('categories:id,name,icon_path')
            ->where('source', $source)
            ->whereBetween('latitude', [$bbox['south'], $bbox['north']])
            ->whereBetween('longitude', [$bbox['west'], $bbox['east']])
            ->get(['id', 'name', 'slug', 'latitude', 'longitude', 'address'])
            ->map(function ($p) use ($oLat, $oLng, $dLat, $dLng) {
                [$t, $perp] = $this->projectOnLine($oLat, $oLng, $dLat, $dLng, (float) $p->latitude, (float) $p->longitude);
                $p->t = $t;
                $p->perp = $perp;

                return $p;
            })
            // Between origin and destination along the line, and inside the corridor.
            ->filter(fn ($p) => $p->t > 0.02 && $p->t < 0.98 && $p->perp <= $corridorM)
            ->sortBy('t')
            ->values();
    }

    /**
     * Endpoint: POST /jelajah/perjalanan — the user starts and finishes a journey.
     * Fills the trips table (two points) and creates a SPECIAL album automatically,
     * without photos.
     *
     * Real mode (journey_demo_mode=false): the user's location must be within
     * CHECKIN_RADIUS_M of the destination, same as a check-in. Verified server-side.
     *
     * Origin and destination must differ (JOURNEY_MIN_SEPARATION_M). The frontend
     * already refuses that, but this endpoint can be called directly — and without
     * a guard here a zero-distance trip would still reach the database, system
     * album and all.
     */
    public function startJourney(Request $request)
    {
        $data = $request->validate([
            'origin_name' => 'required|string|max:255',
            'origin_lat' => 'required|numeric|between:-90,90',
            'origin_lng' => 'required|numeric|between:-180,180',
            'destination_name' => 'required|string|max:255',
            'destination_lat' => 'required|numeric|between:-90,90',
            'destination_lng' => 'required|numeric|between:-180,180',
            'user_lat' => 'nullable|numeric|between:-90,90',
            'user_lng' => 'nullable|numeric|between:-180,180',
        ]);

        $separation = $this->haversineMeters(
            (float) $data['origin_lat'], (float) $data['origin_lng'],
            (float) $data['destination_lat'], (float) $data['destination_lng']
        );
        if ($separation < self::JOURNEY_MIN_SEPARATION_M) {
            return response()->json([
                'ok' => false,
                'message' => 'Titik keberangkatan dan tujuan tidak boleh sama. Pilih dua tempat yang berbeda.',
            ], 422);
        }

        if (! config('nuraloka.journey_demo_mode')) {
            if (! isset($data['user_lat'], $data['user_lng'])) {
                return response()->json(['ok' => false, 'message' => 'Lokasi kamu diperlukan untuk menyelesaikan perjalanan.'], 422);
            }
            $distance = $this->haversineMeters(
                (float) $data['user_lat'], (float) $data['user_lng'],
                (float) $data['destination_lat'], (float) $data['destination_lng']
            );
            if ($distance > self::CHECKIN_RADIUS_M) {
                return response()->json([
                    'ok' => false,
                    'distance' => round($distance),
                    'message' => 'Kamu masih ~'.round($distance).' m dari tujuan. Mendekatlah (≤ '.self::CHECKIN_RADIUS_M.' m) untuk menyelesaikan perjalanan.',
                ], 422);
            }
        }

        $title = 'Trip '.mb_substr($data['origin_name'], 0, 100).' → '.mb_substr($data['destination_name'], 0, 100);

        $trip = Trip::create([
            'user_id' => auth()->id(),
            'title' => $title,
            'origin_name' => $data['origin_name'],
            'origin_latitude' => $data['origin_lat'],
            'origin_longitude' => $data['origin_lng'],
            'destination_name' => $data['destination_name'],
            'destination_latitude' => $data['destination_lat'],
            'destination_longitude' => $data['destination_lng'],
            'trip_date' => now()->toDateString(),
            'is_public' => false,
            'is_system' => true, // album otomatis sistem: judul/lokasi/tanggal terkunci
        ]);

        // SPECIAL album created by the system, with no photos. Reuses the album structure.
        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $title,
            'view_count' => 0,
        ]);

        // Gamification: finishing a two-point journey counts as creating an album.
        // syncAlbumBadges() must follow record(): this endpoint creates a real
        // Album, which feeds the album-derived tiers (Si Paling Trip is literally
        // an album count). Without the sync the badge page's progress ring climbs
        // while the tier icon stays gray — the row is reached but never awarded.
        // AlbumController does the same pairing after every album mutation.
        $journeyUser = auth()->user();
        $gamification = app(GamificationService::class);
        $gamification->record($journeyUser, 'create_album');
        $gamification->syncAlbumBadges($journeyUser);

        return response()->json([
            'ok' => true,
            'album_slug' => $album->slug,
            'message' => 'Perjalanan selesai! Album berhasil dibuat oleh sistem.',
        ]);
    }

    /**
     * Projects a point onto the origin-to-destination line (local equirectangular).
     * Returns [t, perp]: t is the 0..1 position along the line, perp the perpendicular
     * distance in metres.
     */
    private function projectOnLine(float $oLat, float $oLng, float $dLat, float $dLng, float $pLat, float $pLng): array
    {
        $R = 6371000;
        $latRef = deg2rad($oLat);
        $toXY = fn (float $lat, float $lng) => [
            deg2rad($lng - $oLng) * cos($latRef) * $R,
            deg2rad($lat - $oLat) * $R,
        ];

        [$dx, $dy] = $toXY($dLat, $dLng);
        [$px, $py] = $toXY($pLat, $pLng);

        $len2 = $dx * $dx + $dy * $dy;
        $t = $len2 > 0 ? (($px * $dx + $py * $dy) / $len2) : 0.0;

        $projX = $t * $dx;
        $projY = $t * $dy;
        $perp = sqrt(($px - $projX) ** 2 + ($py - $projY) ** 2);

        return [$t, $perp];
    }

    public function show(Request $request, string $slug)
    {
        $place = Place::with(['categories', 'photos'])->where('slug', $slug)->firstOrFail();

        // Record "recently visited" when the detail page opens. This used to be a
        // separate POST that redirected back, which reloaded the Explore page.
        $this->pushRecentlyVisited($request, $place->id);

        // PlaceDetailPresenter builds the props so the Wishlist page
        // (WishlistController::show) shows exactly the same thing.
        return inertia(
            'Explore/Show',
            app(PlaceDetailPresenter::class)->props($place, auth()->user()),
        );
    }

    public function trackVisit(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        $this->pushRecentlyVisited($request, (int) $request->place_id);

        return redirect()->back();
    }

    /**
     * Pushes a place_id onto the session's "recently visited" list: newest first,
     * unique, capped at 5. Called when a detail page is opened.
     */
    private function pushRecentlyVisited(Request $request, int $placeId): void
    {
        $recent = $request->session()->get('recently_visited_places', []);

        // Move it to the front if it is already there.
        if (($key = array_search($placeId, $recent)) !== false) {
            unset($recent[$key]);
        }

        array_unshift($recent, $placeId);
        $recent = array_slice($recent, 0, 5);

        $request->session()->put('recently_visited_places', $recent);
    }

    /**
     * Check-in: records a visit when the user's browser location falls within
     * CHECKIN_RADIUS_M of the place. One unique visit per user and place.
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

        // updateOrCreate keeps it unique per (user, place); checking in again only bumps the time.
        $visit = PlaceVisit::updateOrCreate(
            ['user_id' => auth()->id(), 'place_id' => $place->id],
            ['latitude' => $data['latitude'], 'longitude' => $data['longitude'], 'visited_at' => now()]
        );

        // Gamification: only count NEW visits, so repeatedly checking in at the same
        // place cannot farm mission progress.
        if ($visit->wasRecentlyCreated) {
            app(GamificationService::class)->record(auth()->user(), 'checkin', $place);
        }

        return response()->json([
            'ok' => true,
            'message' => 'Berhasil check-in di '.$place->name.'!',
        ]);
    }

    /**
     * Endpoint JSON: GET /jelajah/trending?lat=&lng=&radius=
     *
     * Returns the "Trending Places" list LIMITED to a radius around the user's
     * browser location, so recommendations never surface places far from them (a
     * user in Sulawesi should not be shown places in Java). Without lat/lng the
     * result matches the global fallback.
     */
    public function trending(Request $request)
    {
        $v = $request->validate([
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:2000',
        ]);

        $lat = isset($v['lat']) ? (float) $v['lat'] : null;
        $lng = isset($v['lng']) ? (float) $v['lng'] : null;
        $radiusKm = isset($v['radius']) ? (float) $v['radius'] : self::TRENDING_RADIUS_KM;

        return response()->json([
            'trendingPlaces' => $this->trendingPlaces(10, $lat, $lng, $radiusKm),
            'radiusKm' => $radiusKm,
            'located' => $lat !== null && $lng !== null,
        ]);
    }

    /**
     * Top-N places by "trending" score: unique visitors, unique album posters and
     * save count, each weighted. Computed live from the database.
     *
     * When $lat and $lng are given, results are limited to places within $radiusKm
     * (haversine) of the user, then ordered by score and capped at $limit.
     */
    private function trendingPlaces(int $limit, ?float $lat = null, ?float $lng = null, ?float $radiusKm = null)
    {
        // Score expression used for ORDER BY. The weights are int constants, so interpolating them is safe.
        $scoreSql =
            '((SELECT COUNT(*) FROM place_visits WHERE place_visits.place_id = places.id) * '.self::WEIGHT_VISIT.') + '
            .'((SELECT COUNT(DISTINCT trips.user_id) FROM trip_photos '
            .'JOIN albums ON albums.id = trip_photos.album_id '
            .'JOIN trips ON trips.id = albums.trip_id '
            .'WHERE trip_photos.place_id = places.id) * '.self::WEIGHT_ALBUM.') + '
            .'((SELECT COUNT(*) FROM saved_places WHERE saved_places.place_id = places.id) * '.self::WEIGHT_SAVE.')';

        // photos and publicTripPhotos are eager-loaded for the card cover image (the
        // img accessor). Loading them together here keeps a row of cards from firing
        // an extra query per card. Photos from private albums are never candidates.
        $query = Place::with(['categories', 'photos', 'publicTripPhotos'])
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
            );

        // Distance filter: only places within the radius (km) of the user, by haversine.
        // least(1, ...) prevents acos returning NaN from floating-point rounding.
        if ($lat !== null && $lng !== null) {
            $radiusKm ??= self::TRENDING_RADIUS_KM;
            $haversineKm = '(6371 * acos(least(1, '
                .'cos(radians(?)) * cos(radians(places.latitude)) * cos(radians(places.longitude) - radians(?)) '
                .'+ sin(radians(?)) * sin(radians(places.latitude)))))';

            $query->selectRaw("$haversineKm as distance_km", [$lat, $lng, $lat])
                ->whereRaw("$haversineKm <= ?", [$lat, $lng, $lat, $radiusKm]);
        }

        return $query
            ->orderByDesc('trending_score')
            ->limit($limit)
            ->get()
            // Hide places with no activity (score 0) so the section is genuinely "trending".
            ->filter(fn ($p) => (int) $p->trending_score > 0)
            ->values()
            // 'img' is appended only here, not via $appends on the model, so the map
            // endpoint (which returns up to 1,500 points) does not load photos it
            // never uses.
            ->each(fn (Place $place) => $place->append('img'));
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
