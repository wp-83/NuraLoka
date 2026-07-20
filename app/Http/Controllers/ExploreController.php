<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Category;
use App\Models\Place;
use App\Models\PlaceVisit;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    // Jumlah titik maksimal yang dikirim per zoom (level-of-detail ala Google Maps).
    // Titik muncul BERTAHAP: sedikit saat zoom jauh, makin banyak saat mendekat —
    // sehingga peta tidak langsung penuh. Berlaku SAMA untuk internal & OSM (satu
    // jenis titik). Di bawah zoom terkecil pada peta ini → tidak ada titik.
    private const ZOOM_BUDGET = [
        16 => 1500,
        15 => 400,
        14 => 200,
        13 => 90,
        12 => 40,
        11 => 18,
    ];

    // Bobot skor "Ramai Dikunjungi": pengunjung > pemosting album > saves.
    private const WEIGHT_VISIT = 3;

    private const WEIGHT_ALBUM = 2;

    private const WEIGHT_SAVE = 1;

    // Radius maksimal (meter) agar check-in dianggap sah (verifikasi lokasi).
    private const CHECKIN_RADIUS_M = 300;

    // Radius default (km) untuk section "Ramai Dikunjungi": hanya place di sekitar
    // lokasi user login. Tempat yang jauh dari daerah user tidak ikut direkomendasikan.
    private const TRENDING_RADIUS_KM = 100;

    /**
     * Endpoint peta: GET /jelajah/titik?south=&west=&north=&east=&zoom=&categories=
     *
     * Membaca dari SATU sumber (tabel places), semua titik diperlakukan seragam.
     * Kepadatan diatur level-of-detail (ala Google Maps): jumlah titik dibatasi per
     * zoom & diprioritaskan (kurasi internal + terpopuler lebih dulu) supaya titik
     * "penting" muncul lebih awal dan sisanya menyusul saat diperbesar. 'source'
     * tidak dikirim ke client.
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

        // Zoom masih terlalu jauh → belum ada titik (peta bersih).
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
            // Prioritas kemunculan: kurasi internal dulu, lalu terpopuler (kunjungan).
            ->orderByRaw("FIELD(source, 'internal', 'osm')")
            ->orderByDesc('visits_count')
            ->orderBy('id')
            ->limit($budget)
            ->get()
            ->map(fn ($p) => $this->mapPoint($p));

        return response()->json(['points' => $points->values()]);
    }

    /** Anggaran jumlah titik untuk suatu zoom (level-of-detail progresif). */
    private function pointBudget(int $zoom): int
    {
        foreach (self::ZOOM_BUDGET as $minZoom => $cap) {
            if ($zoom >= $minZoom) {
                return $cap;
            }
        }

        return 0;
    }

    /** Bentuk seragam satu titik peta untuk sisi user (tanpa membocorkan source). */
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
     * Endpoint pencarian saran (autocomplete): GET /jelajah/cari?q=
     *
     * Membaca dari satu sumber (tabel places). Hanya field ringkas yang dikirim
     * (bukan seluruh baris) agar payload kecil; tanpa membocorkan asal data.
     */
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        // Minimal 2 karakter agar tidak memindai seluruh tabel untuk 1 huruf.
        if (mb_strlen($q) < 2) {
            return response()->json(['suggestions' => []]);
        }

        // Susun ekspresi boolean FULLTEXT: tiap kata jadi prefix (kata*) & operator
        // boolean dibersihkan agar aman. FULLTEXT butuh token >= ft_min_token_size
        // (default 3). Untuk kueri pendek, pakai fallback LIKE.
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
            // Utamakan tempat kurasi (internal) di atas hasil OSM.
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
        // 1. Titik untuk kalkulasi center awal peta — cukup tempat kurasi (internal)
        //    agar payload tetap ringan meski tabel places berisi ribuan titik OSM.
        $places = Place::where('source', 'internal')
            ->get(['id', 'latitude', 'longitude']);

        // 2. Ambil semua kategori untuk filter (beserta icon_path dari DB)
        $categories = Category::all();

        // 3. Trending Places ("Ramai Dikunjungi") — skor berbobot dari data realtime:
        //    pengunjung (check-in) ×3 + pemosting album unik ×2 + saves ×1.
        //    Semua dihitung langsung dari DB tiap request (tidak di-cache).
        //    Daftar ini adalah FALLBACK global: dipakai bila user menolak/ tidak
        //    memberi izin lokasi. Bila lokasi tersedia, frontend memanggil endpoint
        //    trending() agar hasil dibatasi pada radius sekitar user.
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
            // Mode demo: animasi cukup (tanpa validasi lokasi). false = validasi lokasi real.
            'journeyDemoMode' => (bool) config('nuraloka.journey_demo_mode'),
        ]);
    }

    // Koridor SEMPIT (meter) untuk via-point WAJIB: hanya tempat yang benar-benar di
    // jalur yang dipaksa dilewati OSRM, agar rute nyaris tak berbelok. Sengaja jauh lebih
    // ketat dari radius tampilan marker "dekat rute" di frontend.
    private const ROUTE_VIA_CORRIDOR_M = 800;

    // Jarak minimal (meter) antar via-point agar menyebar (tak menumpuk berdekatan).
    private const ROUTE_MIN_SPACING_M = 1500;

    // Batas via-point WAJIB. Sengaja sedikit: makin banyak titik dipaksa dilewati =
    // makin banyak belokan/detour.
    private const ROUTE_MAX_VIA = 3;

    // Jarak maksimal (meter) titik OSM ke JALAN rute nyata agar dianggap "di jalur" dan
    // boleh jadi via-point fallback (dipakai endpoint snap 2-pass). Kecil → dipaksa
    // mampir nyaris tanpa menambah belokan.
    private const ROUTE_SNAP_M = 300;

    /**
     * Endpoint: GET /jelajah/rute-titik — via-point WAJIB untuk membentuk rute OSRM.
     *
     * HANYA place kurasi admin (source=internal) yang benar-benar dekat jalur (koridor
     * sempit ROUTE_VIA_CORRIDOR_M) dan dibatasi sedikit (ROUTE_MAX_VIA), agar rute tidak
     * zigzag. Titik OSM SENGAJA tidak dipaksa dilewati — cukup ditampilkan sebagai marker
     * "dekat rute" oleh frontend lewat sistem titik peta biasa. Bila tak ada tempat admin
     * di jalur, waypoints kosong → rute jadi jalur alami A→B (mulus), OSM tetap terlihat.
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

        // Kotak pembatas A→B diperlebar selebar koridor via, dipakai untuk prefilter SQL.
        $latPad = self::ROUTE_VIA_CORRIDOR_M / 111320;
        $lngPad = self::ROUTE_VIA_CORRIDOR_M / (111320 * max(0.01, cos(deg2rad($oLat))));
        $bbox = [
            'south' => min($oLat, $dLat) - $latPad,
            'north' => max($oLat, $dLat) + $latPad,
            'west' => min($oLng, $dLng) - $lngPad,
            'east' => max($oLng, $dLng) + $lngPad,
        ];

        // Via-point: HANYA place admin (internal) dalam koridor sempit, diurut sepanjang
        // garis A→B. Dengan koridor 800m & ≤3 titik, titik nyaris kolinear dengan garis
        // sehingga urutan garis ≈ urutan rute (tak mundur-maju).
        $candidates = $this->corridorCandidates('internal', $bbox, $oLat, $oLng, $dLat, $dLng, self::ROUTE_VIA_CORRIDOR_M);

        // Jarangkan: lewati titik yang terlalu dekat dengan via-point sebelumnya.
        $waypoints = [];
        foreach ($candidates as $p) {
            $last = end($waypoints);
            if ($last && $this->haversineMeters($last['latitude'], $last['longitude'], (float) $p->latitude, (float) $p->longitude) < self::ROUTE_MIN_SPACING_M) {
                continue;
            }
            // Bentuk seragam dengan titik peta (slug + kategori) agar marker via-point
            // tampil identik: ikon kategori & tombol "Lihat Detail" berfungsi.
            $waypoints[] = $this->mapPoint($p);
            if (count($waypoints) >= self::ROUTE_MAX_VIA) {
                break;
            }
        }

        return response()->json(['waypoints' => $waypoints]);
    }

    /**
     * Endpoint: POST /jelajah/rute-osm — via-point OSM FALLBACK yang "di-snap" ke rute nyata.
     *
     * Dipakai frontend HANYA bila tak ada via-point admin (2-pass): frontend menghitung
     * rute alami A→B dulu, mengirim geometri jalannya (`path`), lalu endpoint ini memilih
     * titik OSM yang benar-benar dekat JALAN (≤ ROUTE_SNAP_M meter dari polyline rute),
     * diurut sepanjang rute & dibatasi sedikit. Karena titik sudah di pinggir jalan yang
     * dilalui, memaksanya jadi via-point nyaris tak menambah belokan (anti-zigzag).
     */
    public function routeOsmWaypoints(Request $request)
    {
        $v = $request->validate([
            'path' => 'required|array|min:2|max:400',
            'path.*' => 'array|size:2',
            'path.*.*' => 'required|numeric',
        ]);

        $path = $v['path']; // [[lat, lng], ...] geometri rute alami dari OSRM.

        // Proyeksi lokal (equirectangular) berpusat di titik awal path → jarak dalam meter.
        $R = 6371000;
        $baseLat = (float) $path[0][0];
        $baseLng = (float) $path[0][1];
        $latRef = deg2rad($baseLat);
        $toXY = fn (float $lat, float $lng) => [
            deg2rad($lng - $baseLng) * cos($latRef) * $R,
            deg2rad($lat - $baseLat) * $R,
        ];

        // Precompute XY tiap titik path + panjang kumulatif (untuk posisi sepanjang rute).
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

        // Kotak pembatas dari rentang path + pad snap (prefilter SQL).
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
            // Hanya titik yang benar-benar menempel jalan rute; urut sepanjang rute.
            ->filter(fn ($p) => $p->snap_dist <= self::ROUTE_SNAP_M)
            ->sortBy('arc')
            ->values();

        // Jarangkan + batasi jumlah (sama seperti via-point admin).
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
     * Jarak tegak lurus (meter) titik ke polyline rute + posisi sepanjang rute (meter).
     * Memproyeksikan titik ke tiap ruas (segmen) lalu mengambil yang terdekat.
     *
     * @param  callable  $toXY  konversi (lat,lng) → [x,y] meter (proyeksi lokal)
     * @param  array<int, array{0:float,1:float}>  $xy  XY tiap titik path
     * @param  array<int, float>  $cum  panjang kumulatif path di tiap titik
     * @return array{0:float, 1:float} [jarak_meter, posisi_sepanjang_rute_meter]
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
     * Kandidat via-point dari satu $source ('internal'/'osm') di sepanjang koridor rute:
     * di-prefilter kotak pembatas $bbox (SQL) lalu diproyeksikan ke garis asal→tujuan,
     * disaring hanya yang berada di antara A & B dan dalam koridor selebar $corridorM,
     * diurut sepanjang garis (nilai t).
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
            // Berada di antara asal & tujuan (sepanjang garis) dan dalam koridor.
            ->filter(fn ($p) => $p->t > 0.02 && $p->t < 0.98 && $p->perp <= $corridorM)
            ->sortBy('t')
            ->values();
    }

    /**
     * Endpoint: POST /jelajah/perjalanan — user menekan "Mulai Perjalanan" & menyelesaikannya.
     * Mengisi tabel trips (2 titik) + membuat album SPECIAL otomatis (tanpa foto).
     *
     * Mode real (journey_demo_mode=false): validasi lokasi user harus dalam radius
     * CHECKIN_RADIUS_M dari titik tujuan (seperti check-in) — otoritatif di server.
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

        // Album SPECIAL dibuat sistem (tanpa foto). Reuse struktur album yang ada.
        $album = Album::create([
            'trip_id' => $trip->id,
            'caption' => $title,
            'view_count' => 0,
        ]);

        // Gamifikasi: menyelesaikan perjalanan 2 titik dihitung sebagai membuat album.
        app(GamificationService::class)->record(auth()->user(), 'create_album');

        return response()->json([
            'ok' => true,
            'album_slug' => $album->slug,
            'message' => 'Perjalanan selesai! Album berhasil dibuat oleh sistem.',
        ]);
    }

    /**
     * Proyeksikan titik ke garis asal→tujuan (equirectangular lokal).
     * Kembalikan [t, perp]: t = posisi 0..1 sepanjang garis, perp = jarak tegak lurus (meter).
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

        // Catat "baru saja dikunjungi" saat detail dibuka (sebelumnya lewat POST
        // terpisah yang me-redirect-back → memicu reload halaman Jelajah).
        $this->pushRecentlyVisited($request, $place->id);

        $isSaved = false;
        if (auth()->check()) {
            $isSaved = auth()->user()->savedPlaces()->where('place_id', $place->id)->exists();
        }

        $totalSaves = DB::table('saved_places')->where('place_id', $place->id)->count();

        $visitorsCount = DB::table('place_visits')->where('place_id', $place->id)->count();
        $albumPostersCount = DB::table('trip_photos')
            ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
            ->join('trips', 'trips.id', '=', 'albums.trip_id')
            ->where('trip_photos.place_id', $place->id)
            ->distinct('trips.user_id')
            ->count('trips.user_id');

        return inertia('Explore/Show', [
            'place' => $place,
            'gallery' => $this->galleryFor($place),
            'isSaved' => $isSaved,
            'totalSaves' => $totalSaves,
            'visitorsCount' => $visitorsCount,
            'albumPostersCount' => $albumPostersCount,
        ]);
    }

    /**
     * Galeri foto untuk halaman detail place, gabungan dari:
     *  1. Foto yang diunggah admin (relasi photos → pivot photo_place).
     *  2. Foto milik user dari album POPULER yang menandai tempat ini
     *     (reuse logika "populer": album publik, user tak dibanned, urut view_count).
     */
    private function galleryFor(Place $place): array
    {
        $adminPhotos = $place->photos
            ->map(fn ($ph) => [
                'id' => 'admin-'.$ph->id,
                'url' => '/storage/'.$ph->path,
            ]);

        $albumPhotos = TripPhoto::query()
            ->join('albums', 'albums.id', '=', 'trip_photos.album_id')
            ->join('trips', 'trips.id', '=', 'albums.trip_id')
            ->join('users', 'users.id', '=', 'trips.user_id')
            ->where('trip_photos.place_id', $place->id)
            ->where('trips.is_public', true)
            ->where('users.is_banned', false)
            ->orderByDesc('albums.view_count')
            ->limit(20)
            ->get(['trip_photos.id', 'trip_photos.photo_path'])
            ->map(fn ($ph) => [
                'id' => 'album-'.$ph->id,
                'url' => '/storage/'.$ph->photo_path,
            ]);

        return $adminPhotos->concat($albumPhotos)->values()->all();
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
     * Simpan place_id ke daftar "baru saja dikunjungi" di session (paling depan,
     * unik, maksimal 5). Dipakai saat membuka halaman detail.
     */
    private function pushRecentlyVisited(Request $request, int $placeId): void
    {
        $recent = $request->session()->get('recently_visited_places', []);

        // Pindahkan ke paling depan bila sudah ada.
        if (($key = array_search($placeId, $recent)) !== false) {
            unset($recent[$key]);
        }

        array_unshift($recent, $placeId);
        $recent = array_slice($recent, 0, 5);

        $request->session()->put('recently_visited_places', $recent);
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
        $visit = PlaceVisit::updateOrCreate(
            ['user_id' => auth()->id(), 'place_id' => $place->id],
            ['latitude' => $data['latitude'], 'longitude' => $data['longitude'], 'visited_at' => now()]
        );

        // Gamifikasi: hanya hitung untuk KUNJUNGAN BARU (tahan-farm; check-in ulang
        // ke tempat sama tidak menambah progres misi).
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
     * Mengembalikan daftar "Ramai Dikunjungi" yang DIBATASI pada radius sekitar lokasi
     * user (dari Geolocation browser) — supaya rekomendasi tidak memunculkan place yang
     * jauh dari daerah user (mis. user di Sulawesi tidak melihat rekomendasi di Jawa).
     * Bila lat/lng tidak dikirim, hasilnya sama dengan fallback global.
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
     * Ambil top-N place berdasarkan skor "ramai": pengunjung unik, pemosting album unik,
     * dan jumlah saves — masing-masing diberi bobot. Dihitung live dari DB.
     *
     * Bila $lat & $lng diberikan, hasil dibatasi hanya place dalam radius $radiusKm
     * (haversine) dari lokasi user, lalu diurutkan berdasar skor & dibatasi $limit.
     */
    private function trendingPlaces(int $limit, ?float $lat = null, ?float $lng = null, ?float $radiusKm = null)
    {
        // Ekspresi skor dipakai untuk ORDER BY. Bobot berupa konstanta int (aman diinterpolasi).
        $scoreSql =
            '((SELECT COUNT(*) FROM place_visits WHERE place_visits.place_id = places.id) * '.self::WEIGHT_VISIT.') + '
            .'((SELECT COUNT(DISTINCT trips.user_id) FROM trip_photos '
            .'JOIN albums ON albums.id = trip_photos.album_id '
            .'JOIN trips ON trips.id = albums.trip_id '
            .'WHERE trip_photos.place_id = places.id) * '.self::WEIGHT_ALBUM.') + '
            .'((SELECT COUNT(*) FROM saved_places WHERE saved_places.place_id = places.id) * '.self::WEIGHT_SAVE.')';

        $query = Place::with('categories')
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

        // Filter jarak: hanya place dalam radius (km) dari lokasi user (rumus haversine).
        // least(1, ...) mencegah NaN dari acos akibat pembulatan floating point.
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
