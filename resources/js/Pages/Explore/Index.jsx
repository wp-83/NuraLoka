// import '@css/Init.css';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ExploreMap from '@components/ExploreMap';
import Footer from '@components/Footer';
import Navbar from '@components/Navbar';
import { FiSearch, FiMapPin, FiBookmark } from 'react-icons/fi';
import { MdRestaurant, MdBeachAccess, MdDiamond, MdMuseum, MdWaterDrop, MdSportsHandball } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';

import { router } from '@inertiajs/react';

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

/* ── ExplorePanel ── */
function ExplorePanel({ activeTab, setActiveTab, searchQuery, setSearchQuery, activeFilters, setActiveFilters, categories, searchSuggestions = [], onSuggestionClick }) {
    const toggleFilter = (label) => {
        setActiveFilters((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
    };
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full" style={{ maxHeight: '100%' }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Eksplor Sesuai Gayamu!
            </h2>
            <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
                {['Satu Titik', 'Dua Titik'].map((tab) => (
                    <div
                        key={tab}
                        role="button"
                        onClick={() => setActiveTab(tab)}
                        className={`cursor-pointer text-center flex-1 py-1.5 rounded-lg text-sm transition-all duration-200 ${activeTab === tab ? 'bg-white text-amber-800 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
                    >
                        {tab}
                    </div>
                ))}
            </div>
            <div className="relative mb-4">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all">
                    <FiSearch size={14} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Temukan destinasi wisatamu sekarang!"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                </div>
                {/* Search Suggestions Dropdown */}
                {searchSuggestions.length > 0 && searchQuery.trim() !== '' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[500] overflow-y-auto max-h-56">
                        {searchSuggestions.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => {
                                    setSearchQuery(place.name); // Isi query
                                    onSuggestionClick(place); // Kunjungi / Fokus Map
                                }}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors"
                            >
                                <FiMapPin className="text-gray-400 flex-shrink-0" size={14} />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{place.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{place.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <span className="block text-sm font-semibold text-gray-700 mb-2">Filter Tempat Spesifik</span>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        role="button"
                        onClick={() => toggleFilter(cat.name)}
                        className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${activeFilters.includes(cat.name) ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-600'}`}
                    >
                        {filterIconMap[cat.name] || <FiMapPin size={13} />}{cat.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── RecentlyVisitedPanel ── */
function RecentlyVisitedPanel({ recentlyVisited = [], onVisit }) {
    if (recentlyVisited.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full">
            <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Baru Saja Dikunjungi
            </h3>
            <div className="flex flex-col gap-2">
                {recentlyVisited.map((place) => (
                    <div
                        key={place.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
                        onClick={() => onVisit(place)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                            {place.img ? (
                                <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                    <FiMapPin size={16} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{place.name}</p>
                            <p className="text-xs text-gray-400 truncate">{place.address}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── MapTooltip ── */
function MapTooltip() {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;
    return (
        <div className="absolute bottom-16 right-72 z-[400] flex items-end gap-2">
            <div className="bg-white rounded-2xl shadow-xl px-5 py-3 max-w-xs relative">
                <p className="text-sm font-bold text-gray-800 mb-0.5">Masih bingung mau ke mana?</p>
                <p className="text-xs text-gray-500">Yuk, lihat tempat-tempat populer pilihan Nuravers!</p>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 shadow-sm" />
            </div>
            <div className="w-16 h-16 flex-shrink-0">
                <img
                    src="/images/mascots/telescope.png"
                    alt="mascot"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>
        </div>
    );
}

/* ── PlaceCard ── */
function PlaceCard({ place, onVisit }) {
    return (
        <div
            onClick={() => onVisit(place)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
        >
            <div className="relative h-44 bg-gray-200 overflow-hidden">
                {place.img ? (
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <FiMapPin size={32} className="text-gray-400" />
                    </div>
                )}
                <button
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
                    style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                    onClick={(e) => { e.stopPropagation(); /* tambah ke saved places future action */ }}
                >
                    <FiBookmark size={14} className="text-gray-600" />
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{place.name}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">{place.address}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {place.categories && place.categories.map((cat) => (
                        <span key={cat.id} className="bg-amber-600 text-white px-3 py-1 rounded-full flex items-center gap-1 font-semibold" style={{ fontSize: '0.68rem' }}>
                            🏛 {cat.name}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6">
                        <img src="/images/mascots/hi.png" alt="visitor" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <span className="text-xs text-gray-500">Ramai disimpan Nuravers</span>
                </div>
            </div>
        </div>
    );
}

/* ── MAIN PAGE ── */
export default function ExploreIndex({ places = [], categories = [], trendingPlaces = [], recentlyVisited = [], auth }) {
    const [activeTab, setActiveTab] = useState('Satu Titik');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const handleVisit = (place) => {
        setSelectedPlace(place);
        // Track the visit
        router.post('/jelajah/track', { place_id: place.id }, { preserveScroll: true, preserveState: true });
    };

    const filteredPlaces = useMemo(() => {
        return places.filter((place) => {
            // Filter by search query
            const matchesSearch = searchQuery === '' ||
                place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filter by active categories
            const matchesFilter = activeFilters.length === 0 ||
                (place.categories && place.categories.some(cat => activeFilters.includes(cat.name)));

            return matchesSearch && matchesFilter;
        });
    }, [places, searchQuery, activeFilters]);

    const searchSuggestions = useMemo(() => {
        if (searchQuery.trim() === '') return [];
        return places
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5); // Tampilkan maksimal 5 tempat teratas
    }, [places, searchQuery]);

    return (
        <>
            <Head title="NuraLoka | Jelajah">
                <meta name="description" content="Jelajahi destinasi wisata, kuliner, dan tempat menarik di seluruh Nusantara bersama NuraLoka." />
            </Head>

            <div className="min-h-screen flex flex-col bg-amber-50">

                {/* ── Navbar ── */}
                <Navbar />

                {/* ── Map Section ── */}
                <section className="relative w-full" style={{ height: '520px' }}>
                    <div className="absolute inset-0">
                        <ExploreMap places={filteredPlaces} selectedPlace={selectedPlace} onVisit={handleVisit} />
                    </div>
                    <div className="absolute inset-y-0 left-0 right-0 flex justify-center pointer-events-none z-[400] py-4">
                        <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-12 items-start gap-5 w-full">
                            <div className="col-start-1 col-end-4 pointer-events-auto relative">
                                <ExplorePanel
                                    activeTab={activeTab} setActiveTab={setActiveTab}
                                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                    activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                                    categories={categories}
                                    searchSuggestions={searchSuggestions}
                                    onSuggestionClick={handleVisit}
                                />
                            </div>
                            <div className="col-start-4 col-end-10" />
                            <div className="col-start-10 col-end-13 pointer-events-auto">
                                <RecentlyVisitedPanel recentlyVisited={recentlyVisited} onVisit={handleVisit} />
                            </div>
                        </div>
                    </div>
                    <MapTooltip />
                </section>

                {/* ── Trending Section ── */}
                <section className="w-full py-10">
                    {/*
                      — overflow-hidden HANYA di section ini, bukan di seluruh page —
                      supaya tidak memotong margin Footer di bawahnya
                    */}
                    <div className="overflow-hidden">
                        <div className="container mx-auto px-4 md:px-6 lg:px-8">
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-start-2 col-end-12 flex items-center gap-4 mb-6">
                                    <div className="w-20 flex-shrink-0">
                                        <img
                                            src="/images/mascots/camera-v2.png"
                                            alt="mascot"
                                            className="w-full object-contain"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-2xl text-gray-900 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Ramai Dikunjungi oleh Nuravers
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1 max-w-[28rem]">
                                            Sedang tren di kalangan Nuravers! Temukan tempat-tempat yang ramai dikunjungi
                                            dan layak masuk daftar perjalananmu
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className="col-start-2 col-end-12 flex flex-row gap-5"
                                    style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '0.75rem', scrollSnapType: 'x mandatory' }}
                                >
                                    {trendingPlaces.map((place) => (
                                        <div key={place.id} className="flex-shrink-0" style={{ width: '20rem', scrollSnapAlign: 'start' }}>
                                            <PlaceCard place={place} onVisit={handleVisit} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <Footer />

            </div>
        </>
    );
}