import '@css/Init.css';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ExploreMap from '@components/ExploreMap';
import Footer from '@components/Footer';
import Navbar from '@components/Navbar';
import { FiSearch, FiMapPin, FiBookmark } from 'react-icons/fi';
import { MdRestaurant, MdBeachAccess, MdDiamond, MdMuseum, MdWaterDrop, MdSportsHandball } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';

/* ─── data ─── */
const RECENTLY_VISITED = [
    { id: 1, name: 'Jembatan Ampera', location: 'Palembang, Sumatera Selatan', img: null },
    { id: 2, name: 'Kampung Kapitan', location: 'Palembang, Sumatera Selatan', img: null },
    { id: 3, name: 'Warung Kopi Ibu Eng', location: 'Palembang, Sumatera Selatan', img: null },
];

const TRENDING_PLACES = [
    { id: 1, name: 'Lawang Sewu', address: 'Jl. Pemuda No.160, Semarang, Jawa Tengah', visitors: '2.976', categories: [{ label: 'Museum', color: 'bg-green-700' }], img: null },
    { id: 2, name: 'Desa Wae Rebo', address: 'Desa Satar Lenda, Manggarai, Nusa Tenggara Timur', visitors: '2.453', categories: [{ label: 'Budaya', color: 'bg-amber-700' }, { label: 'Hidden Gem', color: 'bg-violet-700' }], img: null },
    { id: 3, name: 'Kopi Klotok', address: 'Jl. Kaliurang Km 16, Sleman, Yogyakarta', visitors: '2.190', categories: [{ label: 'Kuliner', color: 'bg-orange-600' }], img: null },
];

const FILTER_TAGS = [
    { label: 'Kuliner', icon: 'MdRestaurant' },
    { label: 'Pegunungan', icon: 'FaMountain' },
    { label: 'Pantai', icon: 'MdBeachAccess' },
    { label: 'Hidden Gem', icon: 'MdDiamond' },
    { label: 'Museum', icon: 'MdMuseum' },
    { label: 'Air Terjun', icon: 'MdWaterDrop' },
    { label: 'Rekreasi', icon: 'MdSportsHandball' },
];

const filterIconMap = {
    MdRestaurant: <MdRestaurant size={15} />,
    FaMountain: <FaMountain size={13} />,
    MdBeachAccess: <MdBeachAccess size={15} />,
    MdDiamond: <MdDiamond size={15} />,
    MdMuseum: <MdMuseum size={15} />,
    MdWaterDrop: <MdWaterDrop size={15} />,
    MdSportsHandball: <MdSportsHandball size={15} />,
};

/* ── ExplorePanel ── */
function ExplorePanel({ activeTab, setActiveTab, searchQuery, setSearchQuery, activeFilters, setActiveFilters }) {
    const toggleFilter = (label) => {
        setActiveFilters((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
    };
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full" style={{ maxHeight: '100%', overflowY: 'auto' }}>
            <h2 className="text-sm font-bold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Eksplor Sesuai Gayamu!
            </h2>
            <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
                {['Satu Titik', 'Dua Titik'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg transition-all duration-200 ${activeTab === tab ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        style={{ fontSize: '0.75rem', fontWeight: activeTab === tab ? 700 : 500 }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-4 bg-gray-50">
                <FiSearch size={14} className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Temukan destinasi wisatamu sekarang!"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent w-full outline-none text-gray-600 placeholder-gray-400"
                    style={{ fontSize: '0.72rem' }}
                />
            </div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Filter Tempat Spesifik</p>
            <div className="flex flex-wrap gap-2">
                {FILTER_TAGS.map(({ label, icon }) => (
                    <button
                        key={label}
                        onClick={() => toggleFilter(label)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all duration-150 ${activeFilters.includes(label) ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-600'}`}
                        style={{ fontSize: '0.68rem', fontWeight: 600 }}
                    >
                        {filterIconMap[icon]}{label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── RecentlyVisitedPanel ── */
function RecentlyVisitedPanel() {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full">
            <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Baru Saja Dikunjungi
            </h3>
            <div className="flex flex-col gap-2">
                {RECENTLY_VISITED.map((place) => (
                    <div key={place.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                            {place.img && <img src={place.img} alt={place.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{place.name}</p>
                            <p className="text-xs text-gray-400 truncate">{place.location}</p>
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
function PlaceCard({ place }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
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
                >
                    <FiBookmark size={14} className="text-gray-600" />
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{place.name}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">{place.address}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {place.categories.map(({ label, color }) => (
                        <span key={label} className={`${color} text-white px-3 py-1 rounded-full flex items-center gap-1 font-semibold`} style={{ fontSize: '0.68rem' }}>
                            🏛 {label}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6">
                        <img src="/images/mascots/hi.png" alt="visitor" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <span className="text-xs text-gray-500"><span className="font-bold text-gray-700">{place.visitors}</span> pengunjung</span>
                </div>
            </div>
        </div>
    );
}

/* ── MAIN PAGE ── */
export default function ExploreIndex({ places = [], auth }) {
    const [activeTab, setActiveTab] = useState('Satu Titik');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

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
                        <ExploreMap places={places} selectedPlace={selectedPlace} />
                    </div>
                    <div className="absolute inset-y-0 left-0 right-0 flex justify-center pointer-events-none z-[400] py-4">
                        <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-12 items-start gap-5 w-full">
                            <div className="col-start-1 col-end-4 pointer-events-auto" style={{ maxHeight: 'calc(100% - 2rem)', overflowY: 'auto' }}>
                                <ExplorePanel
                                    activeTab={activeTab} setActiveTab={setActiveTab}
                                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                    activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                                />
                            </div>
                            <div className="col-start-4 col-end-10" />
                            <div className="col-start-10 col-end-13 pointer-events-auto">
                                <RecentlyVisitedPanel />
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
                                    {TRENDING_PLACES.map((place) => (
                                        <div key={place.id} className="flex-shrink-0" style={{ width: '20rem', scrollSnapAlign: 'start' }}>
                                            <PlaceCard place={place} />
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