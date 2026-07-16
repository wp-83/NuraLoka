import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import MainLayout from '@js/Layouts/MainLayout';
import ExploreMap from '@components/Features/ExploreMap';
import LocationSearchInput from '@components/Features/LocationSearchInput';
import PlaceCard from '@components/Features/PlaceCard';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { MdRestaurant, MdBeachAccess, MdDiamond, MdMuseum, MdWaterDrop, MdSportsHandball } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';

const filterIconMap = {
    'Kuliner': <MdRestaurant size={15} />,
    'Wisata Alam': <FaMountain size={13} />,
    'Pantai': <MdBeachAccess size={15} />,
    'Hidden Gem': <MdDiamond size={15} />,
    'Museum': <MdMuseum size={15} />,
    'Air Terjun': <MdWaterDrop size={15} />,
    'Taman Hiburan': <MdSportsHandball size={15} />,
    'Wisata Budaya': <MdMuseum size={15} />,
    'Belanja': <MdDiamond size={15} />,
    'Religi': <MdMuseum size={15} />,
};

// ── ExplorePanel Sub-Component ──
function ExplorePanel({
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    activeFilters, setActiveFilters,
    categories,
    searchSuggestions = [],
    onSuggestionClick,
    setOrigin, setDestination,
    osmLoading, osmCount
}) {
    const toggleFilter = (label) => {
        setActiveFilters((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-h-full">
            <h2 className="font-heading text-lg font-bold text-primary mb-3">
                Eksplor Sesuai Gayamu!
            </h2>

            {/* Tab Switcher */}
            <div className="flex bg-gray-10 rounded-xl p-1 mb-3 relative">
                <div
                    className="absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out"
                    style={{ transform: activeTab === 'Dua Titik' ? 'translateX(100%)' : 'translateX(0)' }}
                />
                {['Satu Titik', 'Dua Titik'].map((tab) => (
                    <div
                        key={tab}
                        role="button"
                        onClick={() => setActiveTab(tab)}
                        className={`relative z-10 cursor-pointer text-center flex-1 py-1.5 rounded-lg font-body text-btn-sm transition-all duration-300 font-medium ${
                            activeTab === tab ? 'text-accent' : 'text-gray-70 hover:text-primary'
                        }`}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* ── Konten Tab Satu Titik ── */}
            {activeTab === 'Satu Titik' && (
                <>
                    <div className="relative mb-4">
                        <div className="flex items-center gap-2 border border-gray-30 rounded-xl px-3 py-2 bg-gray-10 focus-within:bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-30 transition-all">
                            <FiSearch size={14} className="text-gray-50 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Temukan destinasi wisatamu sekarang!"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent w-full outline-none font-body text-body text-primary placeholder-gray-50"
                            />
                        </div>
                        {searchSuggestions.length > 0 && searchQuery.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-30 rounded-xl shadow-lg z-[500] overflow-y-auto max-h-56">
                                {searchSuggestions.map((place) => (
                                    <div
                                        key={place.id}
                                        onClick={() => onSuggestionClick(place)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-accent-10 cursor-pointer transition-colors"
                                    >
                                        <FiMapPin className="text-gray-50 flex-shrink-0" size={14} />
                                        <div className="min-w-0 flex-grow">
                                            <p className="font-body text-small font-bold text-primary truncate">{place.name}</p>
                                            <p className="font-body text-micro text-gray-50 truncate">{place.address}</p>
                                        </div>
                                        <span
                                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold ${
                                                place.source === 'osm' ? 'bg-info-light text-info-dark' : 'bg-accent-10 text-accent'
                                            }`}
                                        >
                                            {place.source === 'osm' ? 'OSM' : 'NuraLoka'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="block font-body text-small font-semibold text-primary mb-2">Filter Tempat Spesifik</span>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                role="button"
                                onClick={() => toggleFilter(cat.name)}
                                className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border font-body text-micro font-semibold transition-all duration-150 ${
                                    activeFilters.includes(cat.name)
                                        ? 'bg-secondary text-white border-secondary'
                                        : 'bg-white text-primary border-gray-30 hover:border-accent hover:text-accent'
                                }`}
                            >
                                {filterIconMap[cat.name] || <FiMapPin size={13} />}{cat.name}
                            </div>
                        ))}
                    </div>

                    {osmLoading && (
                        <div className="mt-3 pt-3 border-t border-gray-30 flex items-center justify-center">
                            <span className="font-body text-micro text-accent animate-pulse font-medium">Memuat tambahan data peta...</span>
                        </div>
                    )}
                </>
            )}

            {/* ── Konten Tab Dua Titik ── */}
            {activeTab === 'Dua Titik' && (
                <div className="flex flex-col mt-2">
                    <span className="block font-body text-micro font-semibold text-gray-70 mb-1">Tempat Keberangkatan</span>
                    <LocationSearchInput
                        placeholder="Cari lokasi awal..."
                        onSelectLocation={(loc) => setOrigin(loc)}
                    />

                    <span className="block font-body text-micro font-semibold text-gray-70 mb-1">Tempat Tujuan</span>
                    <LocationSearchInput
                        placeholder="Cari lokasi tujuan..."
                        onSelectLocation={(loc) => setDestination(loc)}
                    />
                </div>
            )}
        </div>
    );
}

// ── RecentlyVisitedPanel ──
function RecentlyVisitedPanel({ recentlyVisited = [], onVisit }) {
    if (recentlyVisited.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full">
            <h3 className="font-heading text-small font-bold text-primary mb-3">
                Baru Saja Dikunjungi
            </h3>
            <div className="flex flex-col gap-2">
                {recentlyVisited.slice(0, 3).map((place) => (
                    <div
                        key={place.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-10 rounded-lg p-1 transition-colors"
                        onClick={() => onVisit(place)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-30 flex-shrink-0 overflow-hidden">
                            {place.img ? (
                                <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-30">
                                    <FiMapPin size={16} className="text-gray-50" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-body text-micro font-bold text-primary truncate">{place.name}</p>
                            <p className="font-body text-micro text-gray-50 truncate">{place.address}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── RouteFilterPanel ──
function RouteFilterPanel({ routeData, categories, activeFilters, toggleFilter, routeRadius, setRouteRadius }) {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full relative z-[500]">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading text-small font-bold text-primary">
                    Filter Tempat Spesifik
                </h3>
                {routeData && (
                    <select
                        value={routeRadius}
                        onChange={(e) => setRouteRadius(Number(e.target.value))}
                        className="font-body text-micro bg-gray-10 border border-gray-30 rounded-lg px-2 py-1 outline-none text-primary font-medium cursor-pointer hover:border-accent transition-colors"
                    >
                        <option value={1}>± 1 KM Rute</option>
                        <option value={3}>± 3 KM Rute</option>
                        <option value={5}>± 5 KM Rute</option>
                        <option value={10}>± 10 KM Rute</option>
                        <option value={20}>± 20 KM Rute</option>
                    </select>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        role="button"
                        onClick={() => toggleFilter(cat.name)}
                        className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border font-body text-micro font-semibold transition-all duration-150 ${
                            activeFilters.includes(cat.name)
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-white text-primary border-gray-30 hover:border-accent hover:text-accent'
                        }`}
                    >
                        {filterIconMap[cat.name] || <FiMapPin size={13} />}{cat.name}
                    </div>
                ))}
            </div>

            {routeData && (
                <div className="flex flex-col xl:flex-row xl:items-center gap-3 mt-4 pt-3 border-t border-gray-30">
                    <div className="flex items-center gap-2 font-body text-small font-bold text-primary">
                        <span className="text-accent">🛣</span> ± {routeData.distance} km
                    </div>
                    <div className="flex items-center gap-2 font-body text-small font-bold text-primary">
                        <span className="text-accent">⏱</span> ± {routeData.duration} menit
                    </div>
                </div>
            )}
        </div>
    );
}

// ── MapTooltip ──
function MapTooltip({ isVisible }) {
    if (!isVisible) return null;

    const handleScroll = () => {
        const el = document.getElementById('trending-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            onClick={handleScroll}
            className="flex flex-col items-end cursor-pointer hover:scale-105 transition-transform duration-300"
        >
            <div className="bg-white rounded-2xl shadow-xl px-5 py-3 max-w-xs relative mr-16 z-10">
                <p className="font-body text-small font-bold text-primary mb-0.5">Masih bingung mau ke mana?</p>
                <p className="font-body text-micro text-gray-50">Yuk, lihat tempat-tempat populer pilihan Nuravers!</p>
                <div className="absolute -bottom-2 right-2 w-4 h-4 bg-white rotate-45 shadow-sm" style={{ zIndex: -1 }} />
            </div>
            <div className="w-20 h-20 flex-shrink-0 -mt-4 drop-shadow-lg">
                <img
                    src="/images/mascots/wait.png"
                    alt="mascot"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>
        </div>
    );
}

// ── Loading Overlay (flashscreen saat mencari lokasi / menyusun rute) ──
function SearchLoadingOverlay({ show, isRoute = false }) {
    if (!show) return null;

    const message = isRoute
        ? 'sedang menyusun rute perjalanan terbaik untukmu!'
        : 'sedang mencarikan lokasi yang akurat dan sesuai untukmu!';

    return (
        <div className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-gray-10/95 backdrop-blur-sm">
            <img
                src="/images/gif/run.gif"
                alt="Memuat"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="mt-4 font-body text-body text-primary-100 text-center px-6 max-w-md">
                <span className="font-heading font-bold">
                    <span style={{ color: '#E1740A' }}>Nura</span>
                    <span className="text-secondary-100">Loka</span>
                </span>{' '}
                {message}
            </p>
            <div className="mt-6 h-1.5 w-72 max-w-[80vw] overflow-hidden rounded-full" style={{ backgroundColor: '#E8EEFB' }}>
                <div
                    className="h-full rounded-full"
                    style={{ width: '35%', backgroundColor: '#1D4ED8', animation: 'nl-loading-bar 1.2s ease-in-out infinite' }}
                />
            </div>
            <style>{`@keyframes nl-loading-bar { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }`}</style>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Index({ places = [], categories = [], trendingPlaces = [], recentlyVisited = [], auth, savedPlaceIds = [] }) {
    // ── State ──
    const [activeTab, setActiveTab] = useState('Satu Titik');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false); // overlay fullscreen — pencarian satu titik
    const [routeLoading, setRouteLoading] = useState(false);   // overlay fullscreen — rute dua titik
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [routeRadius, setRouteRadius] = useState(5);
    const [mapPoints, setMapPoints] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);

    // ── Trending "Ramai Dikunjungi" — dibatasi radius sekitar lokasi user ──
    // null = belum terselesaikan (masih menunggu izin lokasi / fetch).
    const [trending, setTrending] = useState(null);
    const [trendingLoading, setTrendingLoading] = useState(true);

    // Saat halaman dimuat: minta lokasi user, lalu ambil rekomendasi di sekitarnya.
    // Bila izin lokasi ditolak / tidak tersedia → pakai daftar global (prop server).
    useEffect(() => {
        let cancelled = false;

        const useFallback = () => {
            if (cancelled) return;
            setTrending(trendingPlaces);
            setTrendingLoading(false);
        };

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            useFallback();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const params = new URLSearchParams({ lat: latitude, lng: longitude });
                    const res = await fetch(`/jelajah/trending?${params.toString()}`, {
                        headers: { Accept: 'application/json' },
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    if (cancelled) return;
                    setTrending(data.trendingPlaces || []);
                    setTrendingLoading(false);
                } catch (err) {
                    console.error('[Trending] Gagal memuat rekomendasi sekitar:', err.message);
                    useFallback();
                }
            },
            () => useFallback(), // ditolak / gagal / timeout → fallback global
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );

        return () => { cancelled = true; };
    }, [trendingPlaces]);

    // ── Refs ──
    const currentBoundsRef = useRef(null);
    const mapFetchTimeoutRef = useRef(null);
    const mapAbortRef = useRef(null);       // membatalkan request yang masih berjalan
    const mapCacheRef = useRef(new Map());  // cache per (zoom+filter+area) → pan/zoom balik instan
    const searchLoadingRef = useRef(false); // cermin state searchLoading untuk dibaca di event peta
    const skipSearchRef = useRef(false);    // lewati refetch dropdown setelah memilih saran
    const searchSafetyRef = useRef(null);   // timeout pengaman agar loading tidak macet

    // Sinkronkan ref dengan state agar bisa dibaca dari handler event peta.
    useEffect(() => { searchLoadingRef.current = searchLoading; }, [searchLoading]);

    // ── Ambil titik/klaster dari server sendiri (DB admin + OSM), tanpa rate-limit ──
    const fetchMapPoints = useCallback(async (bounds) => {
        if (!bounds) return;

        // Batalkan request sebelumnya yang belum selesai
        if (mapAbortRef.current) mapAbortRef.current.abort();

        const { south, west, north, east, zoom } = bounds;
        const cats = activeFilters.join(',');

        // Cache per (zoom + filter + area yang di-snap) → pan/zoom balik instan
        const snap = (n) => Math.round(n * 50) / 50;
        const cacheKey = `${zoom}|${cats}|${snap(south)},${snap(west)},${snap(north)},${snap(east)}`;
        if (mapCacheRef.current.has(cacheKey)) {
            setMapPoints(mapCacheRef.current.get(cacheKey));
            return;
        }

        const controller = new AbortController();
        mapAbortRef.current = controller;
        setMapLoading(true);
        try {
            const params = new URLSearchParams({
                south, west, north, east, zoom, categories: cats,
            });
            const res = await fetch(`/jelajah/titik?${params.toString()}`, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const points = data.points || [];
            mapCacheRef.current.set(cacheKey, points);
            setMapPoints(points);
        } catch (err) {
            if (controller.signal.aborted) return; // dibatalkan request baru → abaikan
            console.error('[Map] Gagal memuat titik peta:', err.message);
        } finally {
            // Hanya request terakhir yang boleh mematikan indikator loading
            if (mapAbortRef.current === controller) {
                mapAbortRef.current = null;
                setMapLoading(false);
            }
        }
    }, [activeFilters]);

    const handleBoundsChange = useCallback((bounds) => {
        currentBoundsRef.current = bounds;
        if (mapFetchTimeoutRef.current) clearTimeout(mapFetchTimeoutRef.current);
        mapFetchTimeoutRef.current = setTimeout(() => fetchMapPoints(bounds), 500);
    }, [fetchMapPoints]);

    // Muat ulang saat filter kategori berubah (pakai viewport terakhir)
    useEffect(() => {
        if (currentBoundsRef.current) fetchMapPoints(currentBoundsRef.current);
    }, [fetchMapPoints]);

    useEffect(() => {
        return () => {
            if (mapFetchTimeoutRef.current) clearTimeout(mapFetchTimeoutRef.current);
            if (mapAbortRef.current) mapAbortRef.current.abort();
        };
    }, []);

    // ── OSRM Route Fetch ──
    const fetchRoute = useCallback(async () => {
        if (!origin || !destination) return;
        setSelectedPlace(null); // hindari popup titik tunggal muncul saat menampilkan rute
        setRouteLoading(true); // tampilkan overlay flashscreen
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const distanceKm = (route.distance / 1000).toFixed(1);
                const durationMin = Math.round(route.duration / 60);
                setRouteData({ coordinates: latLngs, distance: distanceKm, duration: durationMin });
            } else {
                console.warn('Rute tidak ditemukan.');
            }
        } catch (error) {
            console.error('Gagal mengambil rute dari OSRM:', error);
        } finally {
            setRouteLoading(false);
        }
    }, [origin, destination]);

    useEffect(() => {
        if (origin && destination) {
            fetchRoute();
        }
    }, [origin, destination, fetchRoute]);

    // ── Visit / Click handler ──
    const handleVisit = (place) => {
        if (!place || !place.slug) return;
        // Titik OSM tidak punya halaman detail internal.
        if (place.source === 'osm') return;
        // Saran pencarian membawa placeId numerik; place lain (trending/point) pakai id.
        const placeId = place.placeId ?? place.id;
        router.post(route('explore.track'), { place_id: placeId }, {
            preserveScroll: true,
            onSuccess: () => router.visit(route('explore.show', place.slug)),
        });
    };

    const handleToggleSave = (place) => {
        router.post(route('wishlist.toggle'), {
            place_id: place.id,
        }, {
            preserveScroll: true,
        });
    };

    // ── Tab switch: bersihkan rute saat kembali ke "Satu Titik" ──
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSelectedPlace(null);   // bersihkan titik terpilih agar popup lama tak muncul di tab lain
        setSearchLoading(false);  // pastikan flashscreen tidak nyangkut saat pindah tab
        if (tab === 'Satu Titik') {
            setRouteData(null);
            setOrigin(null);
            setDestination(null);
        }
    }, []);

    // ── Pencarian saran (admin + OSM) via backend, dengan debounce 300ms ──
    useEffect(() => {
        // Setelah user memilih saran, query diisi nama tempat → jangan refetch dropdown.
        if (skipSearchRef.current) {
            skipSearchRef.current = false;
            setSearchSuggestions([]);
            return;
        }
        const q = searchQuery.trim();
        if (q === '') { setSearchSuggestions([]); return; }

        const controller = new AbortController();
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/jelajah/cari?q=${encodeURIComponent(q)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                setSearchSuggestions(data.suggestions || []);
            } catch (err) {
                if (!controller.signal.aborted) console.error('[Search] gagal memuat saran:', err.message);
            }
        }, 300);

        return () => { clearTimeout(t); controller.abort(); };
    }, [searchQuery]);

    // Klik saran → zoom ke titik + buka overlay di peta (bukan langsung ke detail).
    const handleSuggestionSelect = useCallback((place) => {
        skipSearchRef.current = true;
        setSearchQuery(place.name);
        setSearchSuggestions([]);
        setSelectedPlace(place);   // memicu flyTo + popup otomatis di ExploreMap
        setSearchLoading(true);    // tampilkan flashscreen
        // Pengaman: sembunyikan paksa bila peta tak mengirim sinyal selesai.
        if (searchSafetyRef.current) clearTimeout(searchSafetyRef.current);
        searchSafetyRef.current = setTimeout(() => setSearchLoading(false), 4000);
    }, []);

    // Peta selesai bergerak (flyTo) → sembunyikan flashscreen pencarian satu titik.
    const handleMapSettle = useCallback(() => {
        if (searchLoadingRef.current) {
            // beri jeda kecil agar titik & popup sempat tampil
            setTimeout(() => setSearchLoading(false), 300);
        }
    }, []);

    const hasInteracted =
        (activeTab === 'Satu Titik' && (searchQuery.trim() !== '' || activeFilters.length > 0 || selectedPlace !== null)) ||
        (activeTab === 'Dua Titik' && (origin !== null || destination !== null));

    // ── Render ──
    return (
        <div className="min-h-screen flex flex-col mt-4">
            {/* ── Flashscreen loading: pencarian satu titik / rute dua titik ── */}
            <SearchLoadingOverlay show={searchLoading || routeLoading} isRoute={routeLoading} />

            {/* ── Map Section ──
                Mobile/tablet: panels stack vertically in normal flow (control → map → secondary panel).
                Desktop (lg+): panels are absolutely positioned overlays on top of a full-bleed map. */}
            <section className="relative w-full flex flex-col gap-4 lg:block lg:gap-0 lg:h-[520px]">
                {/* ── Control Panel (top on mobile, left overlay on desktop) ── */}
                <div className="order-1 lg:order-none w-full z-[400] lg:absolute lg:inset-x-0 lg:top-4 lg:pointer-events-none">
                    <div className="w-full lg:container lg:mx-auto lg:px-4 xl:px-8 lg:grid lg:grid-cols-12">
                        <div className="w-full lg:col-start-1 lg:col-end-4 lg:pointer-events-auto relative">
                            <ExplorePanel
                                activeTab={activeTab} setActiveTab={handleTabChange}
                                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                                categories={categories}
                                searchSuggestions={searchSuggestions}
                                onSuggestionClick={handleSuggestionSelect}
                                setOrigin={setOrigin}
                                setDestination={setDestination}
                                osmLoading={mapLoading}
                                osmCount={mapPoints.length}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Map ── */}
                <div className="order-2 lg:order-none relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden shadow-md lg:rounded-none lg:shadow-none lg:absolute lg:inset-0 lg:h-auto z-0">
                    <ExploreMap
                        places={places}
                        points={mapPoints}
                        selectedPlace={selectedPlace}
                        onVisit={handleVisit}
                        routeData={routeData}
                        origin={origin}
                        destination={destination}
                        onBoundsChange={handleBoundsChange}
                        onSettle={handleMapSettle}
                    />
                </div>

                {/* ── Secondary Panel (bottom on mobile, right overlay on desktop) ── */}
                <div className="order-3 lg:order-none w-full z-[390] lg:absolute lg:inset-x-0 lg:top-4 lg:pointer-events-none">
                    <div className="w-full lg:container lg:mx-auto lg:px-4 xl:px-8 lg:grid lg:grid-cols-12">
                        <div className="w-full lg:col-start-10 lg:col-end-13 lg:pointer-events-auto">
                            {activeTab === 'Satu Titik' ? (
                                <RecentlyVisitedPanel recentlyVisited={recentlyVisited} onVisit={handleVisit} />
                            ) : (
                                <RouteFilterPanel
                                    routeData={routeData}
                                    categories={categories}
                                    activeFilters={activeFilters}
                                    toggleFilter={(label) => {
                                        setActiveFilters((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
                                    }}
                                    routeRadius={routeRadius}
                                    setRouteRadius={setRouteRadius}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Area (Tooltip) — desktop only ── */}
                <div className="hidden lg:block absolute bottom-6 left-0 right-0 pointer-events-none z-[400]">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-12 gap-5 w-full">
                        <div className="col-start-10 col-end-13 pointer-events-auto flex justify-end">
                            <MapTooltip isVisible={!hasInteracted} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trending Section — hanya tempat "ramai" di sekitar lokasi user ──
                Tampil saat masih memuat (spinner) atau saat ada hasil. Bila selesai
                memuat tapi kosong, section disembunyikan. */}
            {(trendingLoading || (trending && trending.length > 0)) && (
            <section id="trending-section" className="w-full py-10">
                <div className="overflow-hidden">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 my-5">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-span-12 sm:col-start-2 sm:col-end-12 flex flex-col sm:flex-row items-center gap-4 mb-6 text-center sm:text-left">
                                <div className="w-28 sm:w-32 lg:w-40 flex-shrink-0 scale-x-[-1]">
                                    <img
                                        src="/images/mascots/map-v2.png"
                                        alt="mascot"
                                        className="w-full object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <h2 className="font-heading text-subtitle sm:text-title font-bold text-primary leading-tight">
                                        Ramai Dikunjungi di Sekitarmu
                                    </h2>
                                    <p className="font-body text-body text-gray-50 mt-1 max-w-[28rem]">
                                        Sedang tren di kalangan Nuravers di sekitar daerahmu! Temukan tempat-tempat
                                        ramai dikunjungi yang layak masuk daftar perjalananmu
                                    </p>
                                </div>
                            </div>
                            {trendingLoading ? (
                                <div className="col-span-12 sm:col-start-2 sm:col-end-12 flex items-center justify-center py-10">
                                    <span className="font-body text-small text-accent animate-pulse font-medium">
                                        Mencari tempat ramai di sekitarmu...
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className="col-span-12 sm:col-start-2 sm:col-end-12 flex flex-row gap-4 sm:gap-5 hide-scrollbar"
                                    style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '0.75rem', scrollSnapType: 'x mandatory' }}
                                >
                                    {trending.map((place) => (
                                        <div key={place.id} className="flex-shrink-0 w-[80vw] sm:w-[22rem] lg:w-96" style={{ scrollSnapAlign: 'start' }}>
                                            <PlaceCard
                                                place={place}
                                                onVisit={handleVisit}
                                                isSaved={savedPlaceIds.includes(place.id)}
                                                onToggleSave={handleToggleSave}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            )}
        </div>
    );
}

Index.layout = (page) => <MainLayout pageTitle="Jelajah" pageDescription="Jelajahi destinasi wisata, kuliner, dan tempat menarik di seluruh Nusantara bersama NuraLoka." content={page}></MainLayout>
