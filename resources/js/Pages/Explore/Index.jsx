import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import MainLayout from '@js/Layouts/MainLayout';
import ExploreMap from '@components/Features/ExploreMap';
import LocationSearchInput from '@components/Features/LocationSearchInput';
import PlaceCard from '@components/Features/PlaceCard';
import { FiMapPin, FiSearch, FiChevronLeft, FiBookmark, FiGlobe } from 'react-icons/fi';
import { MdRestaurant, MdBeachAccess, MdDiamond, MdMuseum, MdWaterDrop, MdSportsHandball } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';

// ── Haversine Distance (km) ──
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Mengecek apakah sebuah titik berjarak kurang dari radius (km) terhadap rute (polyline)
function isPointNearRoute(placeLat, placeLng, routeCoordinates, radiusKm) {
    if (!routeCoordinates || routeCoordinates.length === 0) return false;
    for (let i = 0; i < routeCoordinates.length; i += 5) {
        const [rLat, rLng] = routeCoordinates[i];
        if (haversineDistance(placeLat, placeLng, rLat, rLng) <= radiusKm) return true;
    }
    const [lastLat, lastLng] = routeCoordinates[routeCoordinates.length - 1];
    return haversineDistance(placeLat, placeLng, lastLat, lastLng) <= radiusKm;
}

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

// ── OSM / Overpass API Helpers ──
function getOsmCategory(tags) {
    if (!tags) return null;
    if (['restaurant', 'cafe', 'food_court', 'fast_food'].includes(tags.amenity)) return 'Kuliner';
    if (tags.tourism === 'museum') return 'Museum';
    if (tags.natural === 'beach') return 'Pantai';
    if (tags.natural === 'waterfall' || tags.waterway === 'waterfall') return 'Air Terjun';
    if (
        ['peak', 'volcano'].includes(tags.natural) ||
        tags.leisure === 'nature_reserve' ||
        ['viewpoint', 'attraction'].includes(tags.tourism)
    ) return 'Wisata Alam';
    if (tags.leisure === 'theme_park') return 'Taman Hiburan';
    if (tags.historic) return 'Wisata Budaya';
    if (tags.amenity === 'place_of_worship') return 'Religi';
    if (['mall', 'department_store'].includes(tags.shop)) return 'Belanja';
    return null;
}

function mapOsmToPlace(node) {
    const tags = node.tags || {};
    const name = tags.name || tags['name:id'] || tags['name:en'];
    const category = getOsmCategory(tags);
    if (!name || !category) return null;

    const subtype =
        tags.amenity || tags.tourism || tags.natural ||
        tags.leisure || tags.historic || tags.waterway || tags.shop || '';

    return {
        id: `osm-${node.id}`,
        osmId: node.id,
        name,
        address: tags['addr:full'] || tags['addr:street'] || null,
        latitude: node.lat,
        longitude: node.lon,
        category,
        subtype,
        source: 'osm',
        categories: [{ id: `osm-cat-${category}`, name: category }],
    };
}

function buildOverpassQuery(south, west, north, east) {
    const bbox = `${south},${west},${north},${east}`;
    return `[out:json][timeout:25];
(
  node["amenity"="restaurant"]["name"](${bbox});
  node["amenity"="cafe"]["name"](${bbox});
  node["amenity"="food_court"]["name"](${bbox});
  node["amenity"="fast_food"]["name"](${bbox});
  node["tourism"="museum"]["name"](${bbox});
  node["tourism"="viewpoint"]["name"](${bbox});
  node["tourism"="attraction"]["name"](${bbox});
  node["natural"="beach"]["name"](${bbox});
  node["natural"="peak"]["name"](${bbox});
  node["natural"="waterfall"]["name"](${bbox});
  node["waterway"="waterfall"]["name"](${bbox});
  node["leisure"="theme_park"]["name"](${bbox});
  node["leisure"="nature_reserve"]["name"](${bbox});
  node["historic"]["name"](${bbox});
  node["amenity"="place_of_worship"]["name"](${bbox});
  node["shop"="mall"]["name"](${bbox});
  node["shop"="department_store"]["name"](${bbox});
);
out body 300;`;
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
                                        onClick={() => {
                                            setSearchQuery(place.name);
                                            onSuggestionClick(place);
                                        }}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-accent-10 cursor-pointer transition-colors"
                                    >
                                        <FiMapPin className="text-gray-50 flex-shrink-0" size={14} />
                                        <div className="min-w-0">
                                            <p className="font-body text-small font-bold text-primary truncate">{place.name}</p>
                                            <p className="font-body text-micro text-gray-50 truncate">{place.address}</p>
                                        </div>
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
                {recentlyVisited.slice(0, 2).map((place) => (
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

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Index({ places = [], categories = [], trendingPlaces = [], recentlyVisited = [], auth, savedPlaceIds = [] }) {
    // ── State ──
    const [activeTab, setActiveTab] = useState('Satu Titik');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [routeRadius, setRouteRadius] = useState(5);
    const [osmPlaces, setOsmPlaces] = useState([]);
    const [osmLoading, setOsmLoading] = useState(false);

    // ── Refs ──
    const currentBoundsRef = useRef(null);
    const osmFetchTimeoutRef = useRef(null);

    // ── Fetch Overpass API ──
    const fetchOsmData = useCallback(async (bounds) => {
        if (!bounds) return;
        let { south, west, north, east } = bounds;

        const maxSpan = 1.2;
        const latSpan = Math.abs(north - south);
        const lngSpan = Math.abs(east - west);

        if (latSpan > maxSpan || lngSpan > maxSpan) {
            const centerLat = (south + north) / 2;
            const centerLng = (west + east) / 2;
            south = centerLat - (maxSpan / 2);
            north = centerLat + (maxSpan / 2);
            west = centerLng - (maxSpan / 2);
            east = centerLng + (maxSpan / 2);
        }

        setOsmLoading(true);
        try {
            const query = buildOverpassQuery(south, west, north, east);

            const ENDPOINTS = [
                'https://overpass-api.de/api/interpreter',
                'https://lz4.overpass-api.de/api/interpreter',
                'https://overpass.kumi.systems/api/interpreter',
                'https://z.overpass-api.de/api/interpreter'
            ];

            let data = null;
            let success = false;

            for (const endpoint of ENDPOINTS) {
                try {
                    const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
                    if (response.ok) {
                        data = await response.json();
                        success = true;
                        break;
                    } else {
                        console.warn(`[OSM] Endpoint ${endpoint} returned ${response.status}. Mencoba server berikutnya...`);
                    }
                } catch (e) {
                    console.warn(`[OSM] Endpoint ${endpoint} failed. Mencoba server berikutnya...`);
                }
            }

            if (!success || !data) {
                throw new Error("Semua server publik Overpass API sedang sibuk. Silakan coba lagi nanti.");
            }

            const mapped = (data.elements || [])
                .filter(el => el.type === 'node')
                .map(mapOsmToPlace)
                .filter(Boolean);
            setOsmPlaces(mapped);
        } catch (err) {
            console.error('[OSM Error]:', err.message);
        } finally {
            setOsmLoading(false);
        }
    }, []);

    const handleBoundsChange = useCallback((bounds) => {
        currentBoundsRef.current = bounds;
        if (osmFetchTimeoutRef.current) clearTimeout(osmFetchTimeoutRef.current);
        osmFetchTimeoutRef.current = setTimeout(() => {
            fetchOsmData(bounds);
        }, 1500);
    }, [fetchOsmData]);

    useEffect(() => {
        return () => {
            if (osmFetchTimeoutRef.current) clearTimeout(osmFetchTimeoutRef.current);
        };
    }, []);

    // ── OSRM Route Fetch ──
    const fetchRoute = useCallback(async () => {
        if (!origin || !destination) return;
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
        }
    }, [origin, destination]);

    useEffect(() => {
        if (origin && destination) {
            fetchRoute();
        }
    }, [origin, destination, fetchRoute]);

    // ── Visit / Click handler ──
    const handleVisit = (place) => {
        if (place && place.slug) {
            if (place.id && !String(place.id).startsWith('osm-')) {
                router.post(route('explore.track'), { place_id: place.id }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.visit(route('explore.show', place.slug));
                    }
                });
            } else {
                router.visit(route('explore.show', place.slug));
            }
        }
    };

    const handleToggleSave = (place) => {
        router.post(route('wishlist.toggle'), {
            place_id: place.id,
        }, {
            preserveScroll: true,
        });
    };

    // ── Filtered Places ──
    const filteredPlaces = useMemo(() => {
        return places.filter((place) => {
            if (activeTab === 'Dua Titik' && routeData && routeData.coordinates) {
                const isNear = isPointNearRoute(parseFloat(place.latitude), parseFloat(place.longitude), routeData.coordinates, routeRadius);
                if (!isNear) return false;
            }
            const matchesSearch = searchQuery === '' ||
                place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesFilter = activeFilters.length === 0 ||
                (place.categories && place.categories.some(cat => activeFilters.includes(cat.name)));
            return matchesSearch && matchesFilter;
        });
    }, [places, searchQuery, activeFilters, activeTab, routeData, routeRadius]);

    const filteredOsmPlaces = useMemo(() => {
        return osmPlaces.filter(place => {
            if (activeTab === 'Dua Titik' && routeData && routeData.coordinates) {
                const isNear = isPointNearRoute(place.latitude, place.longitude, routeData.coordinates, routeRadius);
                if (!isNear) return false;
            }
            const matchesFilter = activeFilters.length === 0 || activeFilters.includes(place.category);
            return matchesFilter;
        });
    }, [osmPlaces, activeFilters, activeTab, routeData, routeRadius]);

    const searchSuggestions = useMemo(() => {
        if (searchQuery.trim() === '') return [];
        return places
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5);
    }, [places, searchQuery]);

    const hasInteracted =
        (activeTab === 'Satu Titik' && (searchQuery.trim() !== '' || activeFilters.length > 0 || selectedPlace !== null)) ||
        (activeTab === 'Dua Titik' && (origin !== null || destination !== null));

    // ── Render ──
    return (
        <div className="min-h-screen flex flex-col mt-4">
            {/* ── Map Section ── */}
            <section className="relative w-full" style={{ height: '520px' }}>
                <div className="absolute inset-0 min-h-screen">
                    <ExploreMap
                        places={filteredPlaces}
                        selectedPlace={selectedPlace}
                        onVisit={handleVisit}
                        routeData={routeData}
                        origin={origin}
                        destination={destination}
                        osmPlaces={filteredOsmPlaces}
                        onBoundsChange={handleBoundsChange}
                    />
                </div>

                {/* ── Top Area (Panels) ── */}
                <div className="absolute inset-0 pointer-events-none z-[400] pt-4">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-12 items-start gap-5 w-full">
                        <div className="col-start-1 col-end-4 pointer-events-auto relative">
                            <ExplorePanel
                                activeTab={activeTab} setActiveTab={setActiveTab}
                                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                                categories={categories}
                                searchSuggestions={searchSuggestions}
                                onSuggestionClick={handleVisit}
                                setOrigin={setOrigin}
                                setDestination={setDestination}
                                osmLoading={osmLoading}
                                osmCount={filteredOsmPlaces.length}
                            />
                        </div>
                        <div className="col-start-4 col-end-10" />
                        <div className="col-start-10 col-end-13 pointer-events-auto">
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

                {/* ── Bottom Area (Tooltip) ── */}
                <div className="absolute bottom-6 left-0 right-0 pointer-events-none z-[400]">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-12 gap-5 w-full">
                        <div className="col-start-10 col-end-13 pointer-events-auto flex justify-end">
                            <MapTooltip isVisible={!hasInteracted} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trending Section ── */}
            <section id="trending-section" className="w-full py-10">
                <div className="overflow-hidden">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 my-5">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12 flex items-center gap-4 mb-6">
                                <div className="w-40 flex-shrink-0 scale-x-[-1]">
                                    <img
                                        src="/images/mascots/map-v2.png"
                                        alt="mascot"
                                        className="w-full object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <h2 className="font-heading text-title font-bold text-primary leading-tight">
                                        Ramai Dikunjungi oleh Nuravers
                                    </h2>
                                    <p className="font-body text-body text-gray-50 mt-1 max-w-[28rem]">
                                        Sedang tren di kalangan Nuravers! Temukan tempat-tempat yang ramai dikunjungi
                                        dan layak masuk daftar perjalananmu
                                    </p>
                                </div>
                            </div>
                            <div
                                className="col-start-2 col-end-12 flex flex-row gap-5 hide-scrollbar"
                                style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '0.75rem', scrollSnapType: 'x mandatory' }}
                            >
                                {trendingPlaces.map((place) => (
                                    <div key={place.id} className="flex-shrink-0" style={{ width: '24rem', scrollSnapAlign: 'start' }}>
                                        <PlaceCard
                                            place={place}
                                            onVisit={handleVisit}
                                            isSaved={savedPlaceIds.includes(place.id)}
                                            onToggleSave={handleToggleSave}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

Index.layout = (page) => <MainLayout pageTitle="Jelajah" pageDescription="Jelajahi destinasi wisata, kuliner, dan tempat menarik di seluruh Nusantara bersama NuraLoka." content={page}></MainLayout>
