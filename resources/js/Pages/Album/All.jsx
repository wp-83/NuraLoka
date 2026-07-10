import React from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import Button from '@components/Forms/Button';
import { FiChevronLeft, FiMapPin, FiCalendar } from 'react-icons/fi';

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function SimpleAlbumCard({ album }) {
    return (
        <div
            onClick={() => router.visit(route('album.show', album.id))}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-gray-10 flex flex-col"
        >
            <div className="relative h-44 overflow-hidden bg-gray-10">
                <img
                    src={album.thumbnail ? `/storage/${album.thumbnail}` : '/images/defaults/avatar.png'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-heading font-bold text-sm text-gray-85 mb-3 line-clamp-2 leading-snug group-hover:text-primary-100 transition-colors">
                    {album.title}
                </h3>
                {album.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-50 mb-1.5">
                        <FiMapPin size={13} className="flex-shrink-0" />
                        <span className="truncate">{album.location}</span>
                    </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-50">
                        <FiCalendar size={13} className="flex-shrink-0" />
                        <span>{formatDate(album.date)}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${album.is_public ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${album.is_public ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {album.is_public ? 'Publik' : 'Privat'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function AlbumAll({ albums = [], pageTitle = 'Semua Album Kamu', ownerName = null }) {
    return (
        <>
            <Head title={`NuraLoka | ${pageTitle}`}>
                <meta name="description" content={pageTitle} />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12">
                                {/* Top bar */}
                                <div className="mb-6">
                                    <Button
                                        variant="primary"
                                        size="btn-sm"
                                        onClick={() => router.visit(route('album.index'))}
                                        iconLeft={<FiChevronLeft size={16} />}
                                    >
                                        Kembali
                                    </Button>
                                </div>

                                {/* Title */}
                                <h1 className="text-title md:text-hero font-extrabold text-primary-100 font-heading mb-8">
                                    {pageTitle}
                                </h1>

                                {/* Grid */}
                                {albums.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                        {albums.map((album) => (
                                            <SimpleAlbumCard key={album.id} album={album} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-10 shadow-sm">
                                        <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                                            <img src="/images/mascots/wait.png" alt="Empty" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-gray-50 text-sm">
                                            {ownerName ? `${ownerName} belum memiliki album publik.` : 'Kamu belum memiliki album.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
