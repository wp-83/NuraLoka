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

// Ambil nilai cookie (untuk header CSRF pada fetch non-Inertia).
function getCookie(name) {
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
}

// Ikon fallback per-nama kategori (dipakai bila kategori tidak punya icon_path di DB).
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

// Ikon kategori: pakai icon_path dari DB bila ada; jika null → ikon default per-nama,
// terakhir jatuh ke ikon pin generik.
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

// Format estimasi waktu tempuh (mis. "1 jam 30 menit"). Satuan mengikuti bahasa aktif;
// `t` diteruskan dari komponen pemanggil (explore.unit_hour / explore.unit_minute).
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

// Jarak minimum (km) antara titik keberangkatan dan tujuan. Cerminan
// ExploreController::JOURNEY_MIN_SEPARATION_M (25 m) — server tetap penjaga
// terakhirnya, ini supaya user tahu sebelum menekan "Mulai Perjalanan".
const SAME_POINT_KM = 0.025;

// Dua titik dianggap sama kalau jaraknya di bawah ambang di atas. Bukan
// perbandingan koordinat persis: satu tempat yang sama bisa muncul beberapa
// kali di hasil Nominatim dengan koordinat berbeda beberapa meter.
function isSamePoint(a, b) {
    if (!a || !b) return false;

    return haversineKm(a.lat, a.lng, b.lat, b.lng) <= SAME_POINT_KM;
}

// Saring titik agar hanya menyisakan yang berada dalam radius (km) dari garis rute.
// Koordinat rute di-sampling agar perhitungan tetap ringan pada rute panjang.
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

                {/* Titik yang ditolak karena sama dengan titik satunya. */}
                {pointError && (
                    <p role="alert" className="font-body text-micro text-error-dark">
                        {pointError}
                    </p>
                )}
            </div>
        );
    }

    // State 2/3 — 2 titik terkunci (fixed / running).
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

// ── Loading Overlay (flashscreen saat mencari lokasi / menyusun rute) ──
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
    const [searchLoading, setSearchLoading] = useState(false); // overlay fullscreen — pencarian satu titik
    const [routeLoading, setRouteLoading] = useState(false);   // overlay fullscreen — rute dua titik
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [pointError, setPointError] = useState(null); // titik ditolak karena sama dengan titik satunya
    const [routeData, setRouteData] = useState(null);
    const [routeRadius, setRouteRadius] = useState(5);
    const [mapPoints, setMapPoints] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);

    // ── Perjalanan 2 titik (state machine): 'input' → 'fixed' → 'running' ──
    const [journeyState, setJourneyState] = useState('input');
    const [journeyMsg, setJourneyMsg] = useState(null);      // pesan status/error saat berjalan
    const [journeySaving, setJourneySaving] = useState(false);
    const [completedAlbum, setCompletedAlbum] = useState(null); // slug album → tampilkan modal selesai
    const [userPos, setUserPos] = useState(null);            // posisi GPS user (mode real)
    const [finishReady, setFinishReady] = useState(false);   // mode real: sudah dekat tujuan?
    const geoWatchRef = useRef(null);

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

    // ── Auto-focus dari navigasi Beranda: baca URL params focus_* saat halaman pertama dimuat ──
    // Ini meniru persis logika handleSuggestionSelect agar peta langsung zoom + popup ke tempat
    // yang dipilih pengguna di kotak pencarian halaman Beranda.
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

        // Sama persis dengan handleSuggestionSelect di halaman ini
        skipSearchRef.current = true;
        setSearchQuery(focusName);
        setSelectedPlace(place);   // memicu flyTo + popup otomatis di ExploreMap
        setSearchLoading(true);    // tampilkan flashscreen
        if (searchSafetyRef.current) clearTimeout(searchSafetyRef.current);
        searchSafetyRef.current = setTimeout(() => setSearchLoading(false), 4000);
    }, []); // hanya saat mount

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

    // Pemilihan titik keberangkatan/tujuan. Titik yang sama dengan titik satunya
    // ditolak di sini, sebelum sempat mengunci panel: begitu kedua state terisi
    // panel langsung pindah ke 'fixed' dan membangun rute, jadi menahannya di
    // tahap pemilihan jauh lebih jelas daripada menolak saat "Mulai Perjalanan".
    // ExploreController::startJourney tetap memeriksa ulang di server.
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

    // ── Rute 2 titik: via-point admin dulu; bila kosong, fallback OSM di-snap ke rute ──
    const fetchJourneyRoute = useCallback(async () => {
        if (!origin || !destination) return;
        setSelectedPlace(null);
        setRouteLoading(true);
        try {
            // Bangun rute OSRM: asal → [via-point] → tujuan. Kembalikan objek route OSRM.
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

            // 1. Via-point WAJIB dari tempat admin (internal) yang tepat di jalur.
            const wpParams = new URLSearchParams({
                origin_lat: origin.lat, origin_lng: origin.lng,
                dest_lat: destination.lat, dest_lng: destination.lng,
            });
            let waypoints = [];
            try {
                const wpRes = await fetch(`/jelajah/rute-titik?${wpParams.toString()}`, { headers: { Accept: 'application/json' } });
                if (wpRes.ok) waypoints = (await wpRes.json()).waypoints || [];
            } catch { /* gagal → rute tanpa via-point admin */ }

            // 2. Rute pertama (alami bila belum ada via-point admin).
            let route = await buildOsrm(waypoints);

            // 3. Fallback OSM (2-pass): bila tak ada via-point admin, cari titik OSM yang
            //    ≤300m dari JALAN rute nyata, lalu bangun ulang rute melewatinya. Karena
            //    titik sudah menempel jalan, bentuk rute nyaris tak berubah (anti-zigzag).
            if (waypoints.length === 0 && route) {
                const path = route.geometry.coordinates.map((c) => [c[1], c[0]]); // [lat, lng]
                // Kecilkan payload: ambil maksimal ~200 titik yang mewakili rute.
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
                } catch { /* gagal → pakai rute alami */ }
            }

            if (route) {
                const latLngs = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
                setRouteData({
                    coordinates: latLngs,
                    distance: (route.distance / 1000).toFixed(1),
                    duration: Math.round(route.duration / 60),
                    waypoints,
                });
                setJourneyState('fixed'); // 2 titik terkunci → siap "Mulai Perjalanan"
            } else {
                console.warn('Rute tidak ditemukan.');
            }
        } catch (error) {
            console.error('Gagal mengambil rute:', error);
        } finally {
            setRouteLoading(false);
        }
    }, [origin, destination]);

    // Begitu kedua titik terisi (saat input) → susun rute & kunci panel.
    useEffect(() => {
        if (origin && destination && journeyState === 'input') {
            fetchJourneyRoute();
        }
    }, [origin, destination, journeyState, fetchJourneyRoute]);

    // Bersihkan seluruh state perjalanan (dipakai Batal & pindah tab).
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

    // Simpan trip + album (dipanggil saat perjalanan selesai).
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

    // Klik "Mulai Perjalanan".
    const handleStartJourney = useCallback(() => {
        setJourneyState('running');
        setJourneyMsg(null);
        if (journeyDemoMode) {
            // Demo: animasi mobil berjalan (ExploreMap memanggil onJourneyComplete saat selesai).
            return;
        }
        // Mode real: pantau lokasi user, aktifkan "Selesaikan" saat dekat tujuan.
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

    // Demo: animasi mobil selesai → simpan.
    const handleJourneyAnimationDone = useCallback(() => {
        completeJourney(null);
    }, [completeJourney]);

    // Mode real: klik "Selesaikan Perjalanan" (aktif saat dekat tujuan).
    const handleFinishReal = useCallback(() => {
        completeJourney(userPos);
    }, [completeJourney, userPos]);

    // ── Visit / Click handler ──
    // Navigasi LANGSUNG ke halaman detail (SPA). Pencatatan "baru dikunjungi"
    // dilakukan server saat halaman detail dibuka — tidak lagi lewat POST
    // redirect-back yang memicu reload halaman Jelajah.
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

    // ── Tab switch: bersihkan rute saat kembali ke "Satu Titik" ──
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSelectedPlace(null);   // bersihkan titik terpilih agar popup lama tak muncul di tab lain
        setSearchLoading(false);  // pastikan flashscreen tidak nyangkut saat pindah tab
        if (tab === 'Satu Titik') {
            resetJourney();
        }
    }, [resetJourney]);

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

    // Saat mode rute aktif, hanya tampilkan titik yang berada dalam radius (km) dari
    // garis rute — sesuai pilihan "± X KM Rute". Di luar mode rute, tampilkan semua.
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
            {/* ── Flashscreen loading: pencarian satu titik / rute dua titik ── */}
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

            {/* ── Trending Section — hanya tempat "ramai" di sekitar lokasi user ──
                Tampil saat masih memuat (spinner) atau saat ada hasil. Bila selesai
                memuat tapi kosong, section disembunyikan. */}
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
