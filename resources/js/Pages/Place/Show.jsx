import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import { FiChevronLeft, FiBookmark, FiMapPin, FiUsers } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { MdOutlinePark } from 'react-icons/md';

export default function Show({ place }) {
    // Generate dummy gallery array
    const gallery = [
        { id: 1, height: 'h-[28rem]' },
        { id: 2, height: 'h-64' },
        { id: 3, height: 'h-80' },
        { id: 4, height: 'h-[32rem]' },
        { id: 5, height: 'h-96' },
        { id: 6, height: 'h-64' },
        { id: 7, height: 'h-80' },
        { id: 8, height: 'h-64' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
            <Head title={place?.name || 'Detail Tempat'} />

            <Navbar />

            {/* Hero Section */}
            <section className="relative w-full overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${place?.img || '/images/placeholders/default.jpg'})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                    }}
                />
                <div className="absolute inset-0 bg-white/80 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-[#FDFBF7] z-0"></div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 pt-8 pb-16">
                    {/* Top Buttons */}
                    <div className="flex justify-between items-center mb-8">
                        <Link
                            href={route('explore.index')}
                            className="inline-flex items-center gap-2 bg-[#7C5A41] text-white px-5 py-2.5 rounded-lg hover:bg-[#634834] transition-colors font-medium text-sm shadow-md"
                        >
                            <FiChevronLeft size={18} />
                            Kembali ke Jelajah
                        </Link>
                        <button className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800 transition-colors bg-white/50 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm border border-emerald-100/50">
                            Simpan ke daftar impian
                            <FiBookmark size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                        {/* Left Info */}
                        <div className="w-full lg:w-2/3">
                            <h1 className="text-5xl md:text-6xl font-extrabold text-[#5C3D26] mb-4 drop-shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {place?.name}
                            </h1>
                            <p className="text-emerald-800 font-medium text-lg max-w-3xl mb-6 leading-relaxed">
                                {place?.description || "Deskripsi wisata belum tersedia."}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {place?.categories && place.categories.length > 0 ? (
                                    place.categories.map(cat => (
                                        <div key={cat.id} className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                                            <MdOutlinePark size={16} />
                                            {cat.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                                        <MdOutlinePark size={16} />
                                        Kategori Umum
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <FiMapPin size={22} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-800 font-medium text-sm md:text-base max-w-md">
                                        {place?.address || "Alamat belum tersedia."}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiUsers size={22} className="text-emerald-600 flex-shrink-0" />
                                    <span className="text-gray-800 font-medium text-sm md:text-base">
                                        1.896 pengunjung sejak 2024
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaMoneyBillWave size={22} className="text-emerald-600 flex-shrink-0" />
                                    <span className="text-gray-800 font-medium text-sm md:text-base">
                                        ± Rp85.000,00 - Rp150.000,00/orang
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Map Snippet */}
                        <div className="w-full lg:w-1/3 flex justify-end">
                            <div className="bg-white rounded-2xl p-2 shadow-lg w-full max-w-sm rotate-1 hover:rotate-0 transition-transform duration-300">
                                {/* Using a CSS-based mock map for the snippet to resemble the screenshot */}
                                <div className="relative w-full h-56 bg-emerald-50 rounded-xl overflow-hidden border border-gray-100">
                                    {/* Map roads mock */}
                                    <div className="absolute top-0 bottom-0 left-12 w-2 bg-amber-800/80"></div>

                                    {/* Map Pins */}
                                    <div className="absolute top-6 left-8 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-600 shadow-sm z-10 relative">
                                            <FiMapPin size={16} className="text-emerald-700" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded shadow-sm">{place?.name}</span>
                                    </div>

                                    <div className="absolute top-24 left-8 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500 shadow-sm z-10 relative">
                                            <FaMoneyBillWave size={14} className="text-orange-600" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">Sate Klathak Pak Pong</span>
                                    </div>

                                    <div className="absolute top-44 left-8 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-sm z-10 relative">
                                            <MdOutlinePark size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">Tebing Breksi</span>
                                    </div>

                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-24 h-24 flex-shrink-0 drop-shadow-md scale-x-[-1] transform">
                        <img
                            src="/images/mascots/camera.png"
                            alt="Mascot Camera"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/mascots/camera.png';
                            }}
                        />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#5C3D26]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {place?.name} dalam Potret
                    </h2>
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                    {gallery.map((item, index) => (
                        <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer relative">
                            {/* In real app, we'd use actual gallery images. Using place.img as fallback for all */}
                            <div className={`w-full ${item.height} bg-gray-200`}>
                                <img
                                    src={place?.img || `/images/placeholders/default.jpg`}
                                    alt={`${place?.name} potret ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    style={{ filter: index % 3 === 1 ? 'grayscale(100%)' : 'none' }}
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
