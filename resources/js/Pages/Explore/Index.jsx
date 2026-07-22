import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import MainLayout from '@js/Layouts/MainLayout';
import ExploreMap from '@components/Features/ExploreMap';
import LocationSearchInput from '@components/Features/LocationSearchInput';
import PlaceCard from '@components/Features/PlaceCard';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import { useTranslation } from '@js/i18n';
import { categoryIconUrl } from '@js/categoryIcons';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { MdRestaurant, MdBeachAccess, MdDiamond, MdMuseum, MdWaterDrop, MdSportsHandball } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';
import { GiPathDistance } from 'react-icons/gi';
import { IoTimeOutline } from 'react-icons/io5';

// Read a cookie value, for the CSRF header on non-Inertia fetches.
function getCookie(name) {
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
}

// Per-name fallback icons, used when a category has no icon_path in the database.
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

// Category icon: the database's icon_path when present, otherwise the per-name
// default, and finally a generic pin.
function CategoryIcon({ category }) {
    if (category?.icon_path) {
        return (
            <img
                src={categoryIconUrl(category)}
                alt=""
                className="w-6 h-6 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        );
    }
    return filterIconMap[category?.name] || <FiMapPin size={13} />;
}

// Format an estimated travel time (e.g. "1 jam 30 menit"). The units follow the
// active language; `t` is passed in by the caller (explore.unit_hour and
// explore.unit_minute).
function formatDuration(minutes, t) {
    if (minutes == null || Number.isNaN(minutes)) return '-';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    const hr = t ? t('explore.unit_hour') : 'jam';
    const min = t ? t('explore.unit_minute') : 'menit';
    if (h === 0) return `${m} ${min}`;
    if (m === 0) return `${h} ${hr}`;
    return `${h} ${hr} ${m} ${min}`;
}

// Jarak haversine (km) antara dua koordinat.
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Minimum distance (km) between the origin and the destination. Mirrors
// ExploreController::JOURNEY_MIN_SEPARATION_M (25 m) — the server is still the
// final guard; this exists so the user finds out before pressing "Start".
const SAME_POINT_KM = 0.025;

// Two points count as the same when they are closer than the threshold above.
// Not an exact coordinate comparison: one and the same place can appear several
// times in Nominatim's results with coordinates a few metres apart.
function isSamePoint(a, b) {
    if (!a || !b) return false;

    return haversineKm(a.lat, a.lng, b.lat, b.lng) <= SAME_POINT_KM;
}

// Keep only the points within a radius (km) of the route line. The route
// coordinates are sampled so the maths stays cheap on long routes.
function filterPointsNearRoute(points, routeCoords, radiusKm) {
    if (!routeCoords || routeCoords.length === 0) return points;
    const step = Math.max(1, Math.floor(routeCoords.length / 150));
    const sampled = routeCoords.filter((_, i) => i % step === 0);
    return points.filter((p) => {
        const plat = parseFloat(p.latitude);
        const plng = parseFloat(p.longitude);
        return sampled.some(([rlat, rlng]) => haversineKm(plat, plng, rlat, rlng) <= radiusKm);
    });
}

// ── JourneyPanel: konten tab "Dua Titik" (state machine input → fixed → running) ──
function JourneyPanel({
    state, origin, destination, routeData,
    setOrigin, setDestination, pointError,
    onStart, onCancel, onFinish, demoMode, finishReady, msg, saving,
}) {
    const { t } = useTranslation();
    // State 1 — input: dua pencarian lokasi.
    if (state === 'input') {
        return (
            <div className="flex flex-col mt-2">
                <span className="block font-body text-micro font-semibold text-gray-70 mb-1">{t('explore.origin_label')}</span>
                <LocationSearchInput placeholder={t('explore.origin_placeholder')} onSelectLocation={setOrigin} />

                <span className="block font-body text-micro font-semibold text-gray-70 mb-1">{t('explore.destination_label')}</span>
                <LocationSearchInput placeholder={t('explore.destination_placeholder')} onSelectLocation={setDestination} />

                {/* A point rejected for being the same as the other one. */}
                {pointError && (
                    <p role="alert" className="font-body text-micro text-error-dark">
                        {pointError}
                    </p>
                )}
            </div>
        );
    }

    // State 2/3 — both points locked in (fixed / running).
    return (
        <div className="flex flex-col mt-2 gap-3">
            <div className="rounded-lg border border-gray-30 overflow-hidden">
                <div className="flex items-center gap-4 px-3 py-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                    <div className="min-w-0">
                        <p className="text-small text-gray-70">Keberangkatan</p>
                        <p className="text-body font-bold text-primary truncate">{origin?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-3 py-2 border-t border-gray-20">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                    <div className="min-w-0">
                        <p className="text-small text-gray-70">Tujuan</p>
                        <p className="text-body font-bold text-primary truncate">{destination?.name}</p>
                    </div>
                </div>
            </div>

            {routeData && (
                <div className="flex items-center gap-4 text-body text-secondary">
                    <div className='flex gap-2 items-center'>
                        <GiPathDistance size={16} />
                        <span> ± {routeData.distance} km</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <IoTimeOutline size={16} />
                        <span> ± {formatDuration(routeData.duration, t)}</span>
                    </div>
                </div>
            )}

            {state === 'fixed' && (
                <>
                    <Button
                        onClick={onStart}
                        variant="primary"
                        size="btn-sm"
                        fullWidth
                    >
                        Mulai Perjalanan
                    </Button>
                    <Button
                        onClick={onCancel}
                        unstyled
                        className="text-micro text-gray-50 hover:text-primary self-center"
                    >
                        Ganti titik
                    </Button>
                </>
            )}

            {state === 'running' && (
                <div className="flex flex-col gap-2">
                    {demoMode ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-accent-10 py-2.5 text-small font-semibold text-accent">
                            <span className="animate-pulse">🚗 Perjalanan sedang berlangsung…</span>
                        </div>
                    ) : (
                        <Button
                            onClick={onFinish}
                            disabled={!finishReady || saving}
                            variant={finishReady && !saving ? 'secondary' : 'inactive'}
                            size="btn-sm"
                            fullWidth
                        >
                            {saving ? 'Menyimpan…' : (finishReady ? 'Selesaikan Perjalanan' : 'Mendekatlah ke tujuan…')}
                        </Button>
                    )}
                    {msg && <p className="text-micro text-center text-gray-70">{msg}</p>}
                    <Button
                        onClick={onCancel}
                        variant="gray"
                        size="btn-sm"
                        fullWidth
                    >
                        Batal
                    </Button>
                </div>
            )}
        </div>
    );
}

// ── ExplorePanel Sub-Component ──
function ExplorePanel({
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    activeFilters, setActiveFilters,
    categories,
    searchSuggestions = [],
    onSuggestionClick,
    setOrigin, setDestination,
    osmLoading, osmCount,
    journey,
}) {
    const { t } = useTranslation();
    const toggleFilter = (label) => {
        setActiveFilters((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-h-full">
            <h2 className="font-heading text-lg font-bold text-primary mb-3">
                {t('explore.panel_title')}
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
                        {tab === 'Satu Titik' ? t('explore.tab_single') : t('explore.tab_double')}
                    </div>
                ))}
            </div>

            {/* ── Konten Tab Satu Titik ── */}
            {activeTab === 'Satu Titik' && (
                <>
                    <div className="relative mb-4">
                        <Input
                            type="search"
                            name="searchQuery"
                            icon={<FiSearch size={20} />}
                            placeholder={t('explore.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                            <p className="font-body text-micro text-gray-50 truncate">{place.address || t('explore.address_fallback')}</p>
                                        </div>
                                        {place.categories?.[0]?.name && (
                                            <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold bg-accent-10 text-accent">
                                                {place.categories[0].name}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="block font-body text-body font-bold text-primary mb-2">{t('explore.filter_title')}</span>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                role="button"
                                onClick={() => toggleFilter(cat.name)}
                                className={`cursor-pointer flex items-center justify-center gap-1 px-4 py-1.5 rounded-md border font-body text-small transition-all duration-150 ${
                                    activeFilters.includes(cat.name)
                                        ? 'bg-secondary text-white border-secondary'
                                        : 'bg-white text-primary border-gray-30 hover:border-accent hover:text-accent'
                                }`}
                            >
                                <CategoryIcon category={cat} />{cat.name}
                            </div>
                        ))}
                    </div>

                    {osmLoading && (
                        <div className="mt-3 pt-3 border-t border-gray-30 flex items-center justify-center">
                            <span className="font-body text-micro text-accent animate-pulse font-medium">{t('explore.map_loading_extra')}</span>
                        </div>
                    )}
                </>
            )}

            {/* ── Konten Tab Dua Titik: alur perjalanan ── */}
            {activeTab === 'Dua Titik' && (
                <JourneyPanel
                    state={journey.state}
                    origin={journey.origin}
                    destination={journey.destination}
                    routeData={journey.routeData}
                    setOrigin={setOrigin}
                    setDestination={setDestination}
                    pointError={journey.pointError}
                    onStart={journey.onStart}
                    onCancel={journey.onCancel}
                    onFinish={journey.onFinish}
                    demoMode={journey.demoMode}
                    finishReady={journey.finishReady}
                    msg={journey.msg}
                    saving={journey.saving}
                />
            )}
        </div>
    );
}

// ── RecentlyVisitedPanel ──
function RecentlyVisitedPanel({ recentlyVisited = [], onVisit }) {
    const { t } = useTranslation();
    if (recentlyVisited.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full">
            <h3 className="font-heading text-body font-bold text-primary mb-3">
                {t('explore.recently_visited')}
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
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <FiMapPin size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-body text-small font-bold text-primary truncate">{place.name}</p>
                            <p className="font-body text-micro text-gray-50 truncate">{place.address || t('explore.address_fallback')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── RouteFilterPanel ──
function RouteFilterPanel({ routeData, categories, activeFilters, toggleFilter, routeRadius, setRouteRadius }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full relative z-[500]">
            <div className="flex flex-col justify-between items-start mb-6 gap-2">
                <h3 className="font-heading text-small font-bold text-primary">
                    {t('explore.filter_title')}
                </h3>
                {routeData && (
                    <select
                        value={routeRadius}
                        onChange={(e) => setRouteRadius(Number(e.target.value))}
                        className="font-body text-small bg-gray-10 border border-gray-30 rounded-lg px-2 py-1 outline-none text-primary font-medium cursor-pointer hover:border-accent transition-colors"
                    >
                        <option value={1}>{t('explore.route_radius', { km: 1 })}</option>
                        <option value={3}>{t('explore.route_radius', { km: 3 })}</option>
                        <option value={5}>{t('explore.route_radius', { km: 5 })}</option>
                        <option value={10}>{t('explore.route_radius', { km: 10 })}</option>
                        <option value={20}>{t('explore.route_radius', { km: 20 })}</option>
                    </select>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        role="button"
                        onClick={() => toggleFilter(cat.name)}
                        className={`cursor-pointer flex items-center justify-center gap-1 px-2 py-1.5 rounded-sm border font-body text-small transition-all duration-150 ${
                            activeFilters.includes(cat.name)
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-white text-primary border-gray-30 hover:border-accent hover:text-accent'
                        }`}
                    >
                        {filterIconMap[cat.name] || <FiMapPin size={16} />}{cat.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── MapTooltip ──
function MapTooltip({ isVisible }) {
    const { t } = useTranslation();
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
                <p className="font-body text-body font-bold text-primary mb-0.5">{t('explore.tooltip_title')}</p>
                <p className="font-body text-micro text-gray-50">{t('explore.tooltip_desc')}</p>
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

// Loading overlay: the full-screen flash shown while a place is being found or
// a route built.
function SearchLoadingOverlay({ show, isRoute = false }) {
    const { t } = useTranslation();
    if (!show) return null;

    const message = isRoute
        ? t('explore.overlay_route')
        : t('explore.overlay_search');

    return (
        <div className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-gray-10">
            <img
                src="/images/gif/run.gif"
                alt="Memuat"
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="mt-4 font-heading text-paragraph text-primary-100 text-center px-6">
                <span className="font-heading font-bold">
                    <span style={{ color: '#E1740A' }}>Nura</span>
                    <span className="text-secondary-100">Loka</span>
                </span>{' '}
                {message}
            </p>
            <div className="mt-6 h-1.75 w-[80vw] overflow-hidden rounded-full" style={{ backgroundColor: '#E8EEFB' }}>
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
export default function Index({ places = [], categories = [], trendingPlaces = [], recentlyVisited = [], auth, savedPlaceIds = [], journeyDemoMode = true }) {
    const { t } = useTranslation();
    // ── State ──
    const [activeTab, setActiveTab] = useState('Satu Titik');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false); // full-screen overlay: single-point search
    const [routeLoading, setRouteLoading] = useState(false);   // full-screen overlay: two-point route
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [pointError, setPointError] = useState(null); // point rejected for matching the other one
    const [routeData, setRouteData] = useState(null);
    const [routeRadius, setRouteRadius] = useState(5);
    const [mapPoints, setMapPoints] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);

    // Two-point journey state machine: 'input' → 'fixed' → 'running'.
    const [journeyState, setJourneyState] = useState('input');
    const [journeyMsg, setJourneyMsg] = useState(null);      // status or error while running
    const [journeySaving, setJourneySaving] = useState(false);
    const [completedAlbum, setCompletedAlbum] = useState(null); // album slug → show the finished modal
    const [userPos, setUserPos] = useState(null);            // the user's GPS position (real mode)
    const [finishReady, setFinishReady] = useState(false);   // real mode: close enough to the destination?
    const geoWatchRef = useRef(null);

    // Trending places, limited to a radius around the user.
    // null means unresolved — still waiting on location permission or the fetch.
    const [trending, setTrending] = useState(null);
    const [trendingLoading, setTrendingLoading] = useState(true);

    // On load: ask for the user's location, then fetch recommendations near them.
    // If permission is denied or unavailable, fall back to the global list that
    // came in the server props.
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
    const mapAbortRef = useRef(null);       // aborts a request still in flight
    const mapCacheRef = useRef(new Map());  // cache per (zoom+filter+area): panning back is instant
    const searchLoadingRef = useRef(false); // mirrors searchLoading, readable from map events
    const skipSearchRef = useRef(false);    // skip the dropdown refetch after picking a suggestion
    const searchSafetyRef = useRef(null);   // safety timeout so the loader cannot stick

    // Keep the ref in step with the state so map event handlers can read it.
    useEffect(() => { searchLoadingRef.current = searchLoading; }, [searchLoading]);

    // Auto-focus when arriving from the home page: read the focus_* URL params on
    // first load. This repeats handleSuggestionSelect exactly, so the map zooms
    // straight to the place the user picked in the home page's search box and
    // opens its popup.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const focusId  = params.get('focus_id');
        const focusLat = parseFloat(params.get('focus_lat'));
        const focusLng = parseFloat(params.get('focus_lng'));
        const focusName = params.get('focus_name') || '';

        if (!focusId || isNaN(focusLat) || isNaN(focusLng)) return;

        const place = {
            id:        parseInt(focusId, 10),
            name:      focusName,
            slug:      params.get('focus_slug') || '',
            address:   params.get('focus_address') || '',
            latitude:  focusLat,
            longitude: focusLng,
        };

        // Identical to handleSuggestionSelect on this page.
        skipSearchRef.current = true;
        setSearchQuery(focusName);
        setSelectedPlace(place);   // triggers the flyTo and auto-popup in ExploreMap
        setSearchLoading(true);    // show the overlay
        if (searchSafetyRef.current) clearTimeout(searchSafetyRef.current);
        searchSafetyRef.current = setTimeout(() => setSearchLoading(false), 4000);
    }, []); // on mount only

    // Fetch points from our own server (the admin DB plus OSM), with no rate limit.
    const fetchMapPoints = useCallback(async (bounds) => {
        if (!bounds) return;

        // Cancel any earlier request still in flight.
        if (mapAbortRef.current) mapAbortRef.current.abort();

        const { south, west, north, east, zoom } = bounds;
        const cats = activeFilters.join(',');

        // Cache per (zoom + filter + snapped area), so panning back is instant.
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
            if (controller.signal.aborted) return; // superseded by a newer request
            console.error('[Map] Failed to load map points:', err.message);
        } finally {
            // Only the most recent request may clear the loading indicator.
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

    // Reload when the category filter changes, reusing the last viewport.
    useEffect(() => {
        if (currentBoundsRef.current) fetchMapPoints(currentBoundsRef.current);
    }, [fetchMapPoints]);

    useEffect(() => {
        return () => {
            if (mapFetchTimeoutRef.current) clearTimeout(mapFetchTimeoutRef.current);
            if (mapAbortRef.current) mapAbortRef.current.abort();
        };
    }, []);

    // Choosing the origin and destination. A point identical to the other one is
    // rejected HERE, before the panel can lock: once both are set the panel moves
    // straight to 'fixed' and builds a route, so catching it at selection time is
    // far clearer than refusing at "Start journey".
    // ExploreController::startJourney still re-checks this on the server.
    const selectOrigin = useCallback((loc) => {
        if (isSamePoint(loc, destination)) {
            setPointError(t('explore.journey_same_point'));

            return;
        }
        setPointError(null);
        setOrigin(loc);
    }, [destination, t]);

    const selectDestination = useCallback((loc) => {
        if (isSamePoint(loc, origin)) {
            setPointError(t('explore.journey_same_point'));

            return;
        }
        setPointError(null);
        setDestination(loc);
    }, [origin, t]);

    // Two-point route: admin via-points first; if there are none, fall back to
    // OSM points snapped onto the route.
    const fetchJourneyRoute = useCallback(async () => {
        if (!origin || !destination) return;
        setSelectedPlace(null);
        setRouteLoading(true);
        try {
            // Build an OSRM route: origin → [via-points] → destination.
            const buildOsrm = async (viaPoints) => {
                const seq = [
                    [origin.lng, origin.lat],
                    ...viaPoints.map((w) => [w.longitude, w.latitude]),
                    [destination.lng, destination.lat],
                ].map((c) => c.join(',')).join(';');
                const url = `https://router.project-osrm.org/route/v1/driving/${seq}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                return data.code === 'Ok' && data.routes.length > 0 ? data.routes[0] : null;
            };

            // 1. Required via-points: admin (internal) places right on the path.
            const wpParams = new URLSearchParams({
                origin_lat: origin.lat, origin_lng: origin.lng,
                dest_lat: destination.lat, dest_lng: destination.lng,
            });
            let waypoints = [];
            try {
                const wpRes = await fetch(`/jelajah/rute-titik?${wpParams.toString()}`, { headers: { Accept: 'application/json' } });
                if (wpRes.ok) waypoints = (await wpRes.json()).waypoints || [];
            } catch { /* failed → route without admin via-points */ }

            // 2. The first route (the natural one when there are no admin via-points).
            let route = await buildOsrm(waypoints);

            // 3. OSM fallback (two passes): with no admin via-points, look for OSM
            //    points within 300 m of the actual route ROAD, then rebuild the
            //    route through them. Because those points already sit on the road,
            //    the route's shape barely changes — no zigzagging.
            if (waypoints.length === 0 && route) {
                const path = route.geometry.coordinates.map((c) => [c[1], c[0]]); // [lat, lng]
                // Shrink the payload: at most ~200 points to represent the route.
                const step = Math.ceil(path.length / 200);
                const slim = step > 1 ? path.filter((_, i) => i % step === 0 || i === path.length - 1) : path;
                try {
                    const osmRes = await fetch('/jelajah/rute-osm', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({ path: slim }),
                    });
                    if (osmRes.ok) {
                        const osmWps = (await osmRes.json()).waypoints || [];
                        if (osmWps.length > 0) {
                            const route2 = await buildOsrm(osmWps);
                            if (route2) { route = route2; waypoints = osmWps; }
                        }
                    }
                } catch { /* failed → keep the natural route */ }
            }

            if (route) {
                const latLngs = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
                setRouteData({
                    coordinates: latLngs,
                    distance: (route.distance / 1000).toFixed(1),
                    duration: Math.round(route.duration / 60),
                    waypoints,
                });
                setJourneyState('fixed'); // both points locked → ready to start
            } else {
                console.warn('[Route] No route found.');
            }
        } catch (error) {
            console.error('[Route] Failed to fetch route:', error);
        } finally {
            setRouteLoading(false);
        }
    }, [origin, destination]);

    // As soon as both points are set (while in input), build the route and lock
    // the panel.
    useEffect(() => {
        if (origin && destination && journeyState === 'input') {
            fetchJourneyRoute();
        }
    }, [origin, destination, journeyState, fetchJourneyRoute]);

    // Clear all journey state. Used by Cancel and by switching tabs.
    const resetJourney = useCallback(() => {
        if (geoWatchRef.current != null && navigator.geolocation) {
            navigator.geolocation.clearWatch(geoWatchRef.current);
            geoWatchRef.current = null;
        }
        setJourneyState('input');
        setJourneyMsg(null);
        setJourneySaving(false);
        setUserPos(null);
        setFinishReady(false);
        setRouteData(null);
        setOrigin(null);
        setDestination(null);
        setPointError(null);
    }, []);

    // Save the trip and its album, once the journey is finished.
    const completeJourney = useCallback(async (userLatLng = null) => {
        if (!origin || !destination || journeySaving) return;
        setJourneySaving(true);
        setJourneyMsg('Menyimpan perjalanan…');
        try {
            const res = await fetch('/jelajah/perjalanan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    origin_name: origin.name, origin_lat: origin.lat, origin_lng: origin.lng,
                    destination_name: destination.name, destination_lat: destination.lat, destination_lng: destination.lng,
                    user_lat: userLatLng?.lat ?? null, user_lng: userLatLng?.lng ?? null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setCompletedAlbum(data.album_slug);   // tampilkan modal selesai
            } else {
                setJourneyMsg(data.message || 'Gagal menyelesaikan perjalanan.');
            }
        } catch (e) {
            setJourneyMsg('Gagal terhubung ke server. Coba lagi.');
        } finally {
            setJourneySaving(false);
        }
    }, [origin, destination, journeySaving]);

    // The "Start journey" click.
    const handleStartJourney = useCallback(() => {
        setJourneyState('running');
        setJourneyMsg(null);
        if (journeyDemoMode) {
            // Demo: the car animation runs, and ExploreMap calls
            // onJourneyComplete when it finishes.
            return;
        }
        // Real mode: watch the user's location and enable "Finish" once they are
        // near the destination.
        setJourneyMsg('Menuju tujuan… tombol Selesai aktif saat kamu dekat.');
        if (navigator.geolocation) {
            geoWatchRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserPos(p);
                    const d = haversineKm(p.lat, p.lng, destination.lat, destination.lng) * 1000;
                    setFinishReady(d <= 300);
                },
                () => setJourneyMsg('Izin lokasi ditolak. Aktifkan lokasi untuk menyelesaikan perjalanan.'),
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
            );
        }
    }, [journeyDemoMode, destination]);

    // Demo: the car animation finished — save.
    const handleJourneyAnimationDone = useCallback(() => {
        completeJourney(null);
    }, [completeJourney]);

    // Real mode: the "Finish journey" click, enabled near the destination.
    const handleFinishReal = useCallback(() => {
        completeJourney(userPos);
    }, [completeJourney, userPos]);

    // Visit / click handler.
    // Navigates STRAIGHT to the detail page (SPA). The "recently visited" record
    // is written by the server when that page opens, rather than by a
    // POST-and-redirect-back that would reload the Explore page.
    const handleVisit = (place) => {
        if (!place || !place.slug) return;
        router.visit(route('explore.show', place.slug));
    };

    const handleToggleSave = (place) => {
        router.post(route('wishlist.toggle'), {
            place_id: place.id,
        }, {
            preserveScroll: true,
        });
    };

    // Tab switch: clear the route when going back to the single-point tab.
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSelectedPlace(null);   // drop the selection so an old popup cannot follow
        setSearchLoading(false);  // make sure the overlay cannot stick across tabs
        if (tab === 'Satu Titik') {
            resetJourney();
        }
    }, [resetJourney]);

    // Suggestion search (admin + OSM) through the backend, debounced by 300 ms.
    useEffect(() => {
        // After a suggestion is picked the query holds the place name — do not
        // refetch the dropdown for it.
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

    // Clicking a suggestion zooms to the point and opens the map overlay, rather
    // than jumping straight to the detail page.
    const handleSuggestionSelect = useCallback((place) => {
        skipSearchRef.current = true;
        setSearchQuery(place.name);
        setSearchSuggestions([]);
        setSelectedPlace(place);   // triggers the flyTo and auto-popup in ExploreMap
        setSearchLoading(true);    // show the overlay
        // Safety net: hide it anyway if the map never signals that it settled.
        if (searchSafetyRef.current) clearTimeout(searchSafetyRef.current);
        searchSafetyRef.current = setTimeout(() => setSearchLoading(false), 4000);
    }, []);

    // The map finished moving (flyTo) — hide the single-point search overlay.
    const handleMapSettle = useCallback(() => {
        if (searchLoadingRef.current) {
            // a short pause so the point and its popup have time to appear
            setTimeout(() => setSearchLoading(false), 300);
        }
    }, []);

    // In route mode show only the points within the chosen radius (km) of the
    // route line — the "± X KM Rute" setting. Outside route mode, show them all.
    const displayedPoints = useMemo(() => {
        if (routeData && routeData.coordinates) {
            return filterPointsNearRoute(mapPoints, routeData.coordinates, routeRadius);
        }
        return mapPoints;
    }, [mapPoints, routeData, routeRadius]);

    const hasInteracted =
        (activeTab === 'Satu Titik' && (searchQuery.trim() !== '' || activeFilters.length > 0 || selectedPlace !== null)) ||
        (activeTab === 'Dua Titik' && (origin !== null || destination !== null));

    // ── Render ──
    return (
        <div className="min-h-screen flex flex-col mt-4">
            {/* Loading overlay: single-point search or two-point route. */}
            <SearchLoadingOverlay show={searchLoading || routeLoading} isRoute={routeLoading} />

            {/* ── Map Section ──
                Mobile/tablet: panels stack vertically in normal flow (control → map → secondary panel).
                Desktop (lg+): panels are absolutely positioned overlays on top of a full-bleed map. */}
            <section className="relative w-full flex flex-col gap-4 lg:block lg:gap-0 lg:h-[620px]">
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
                                setOrigin={selectOrigin}
                                setDestination={selectDestination}
                                osmLoading={mapLoading}
                                osmCount={mapPoints.length}
                                journey={{
                                    state: journeyState,
                                    origin, destination, routeData, pointError,
                                    onStart: handleStartJourney,
                                    onCancel: resetJourney,
                                    onFinish: handleFinishReal,
                                    demoMode: journeyDemoMode,
                                    finishReady, msg: journeyMsg, saving: journeySaving,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Map ── */}
                <div className="order-2 lg:order-none relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden shadow-md lg:rounded-none lg:shadow-none lg:absolute lg:inset-0 lg:h-auto z-0">
                    <ExploreMap
                        places={places}
                        points={displayedPoints}
                        selectedPlace={selectedPlace}
                        onVisit={handleVisit}
                        routeData={routeData}
                        origin={origin}
                        destination={destination}
                        onBoundsChange={handleBoundsChange}
                        onSettle={handleMapSettle}
                        journeyRunning={journeyState === 'running'}
                        journeyDemo={journeyDemoMode}
                        userPosition={userPos}
                        onJourneyComplete={handleJourneyAnimationDone}
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

            {/* Trending section — only busy places near the user's location.
                Shown while loading (the spinner) and when there are results. Once
                loading has finished with nothing to show, the section is hidden. */}
            {(trendingLoading || (trending && trending.length > 0)) && (
            <section id="trending-section" className="w-full py-10">
                <div className="overflow-hidden">
                    <div className="mb-8">
                        <div className="grid">
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
                                        {t('explore.trending_title')}
                                    </h2>
                                    <p className="font-body text-body text-gray-50 mt-1 max-w-[40rem]">
                                        {t('explore.trending_desc')}
                                    </p>
                                </div>
                            </div>
                            {trendingLoading ? (
                                <div className="col-span-12 sm:col-start-2 sm:col-end-12 flex items-center justify-center py-10">
                                    <span className="font-body text-small text-accent animate-pulse font-medium">
                                        {t('explore.trending_loading')}
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

            {/* ── Modal: perjalanan selesai & album dibuat sistem ── */}
            {completedAlbum && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                        <img src="/images/mascots/car.png" alt="" className="mx-auto mb-3 h-24 w-24 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        <h3 className="font-heading text-title font-bold text-primary">Perjalanan Selesai!</h3>
                        <p className="mt-2 font-body text-body text-gray-70">
                            Kamu telah menyelesaikan perjalanan dan album telah berhasil dibuat oleh sistem.
                        </p>
                        <Button
                            onClick={() => router.visit(route('album.show', completedAlbum))}
                            variant="primary"
                            size="btn-sm"
                            fullWidth
                            className="mt-5"
                        >
                            Lihat Album Perjalanan
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = (page) => <MainLayout pageTitle="title.explore" pageDescription="Jelajahi destinasi wisata, kuliner, dan tempat menarik di seluruh Nusantara bersama NuraLoka." content={page}></MainLayout>
