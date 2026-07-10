import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import Button from '@components/Forms/Button';
import { FiChevronLeft, FiMapPin, FiCalendar, FiEdit2, FiTrash2, FiX, FiChevronRight } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi';

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatViews(count) {
    if (!count) return '0';
    return count.toLocaleString('id-ID');
}

export default function AlbumShow({ album, photos = [], isOwner = false, author = {} }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prevPhoto = () => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    const nextPhoto = () => setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));

    // Lock body scroll saat lightbox terbuka
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [lightboxIndex]);

    const handleDelete = () => {
        if (confirm('Yakin ingin menghapus album ini? Semua foto akan ikut terhapus.')) {
            router.delete(route('album.destroy', album.id));
        }
    };

    const handleToggleVisibility = () => {
        router.post(route('album.toggle.visibility', album.id), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`NuraLoka | ${album.title}`}>
                <meta name="description" content={`Album perjalanan: ${album.title}`} />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12">
                                {/* Top bar: Kembali + Visibilitas / Author */}
                                <div className="flex items-center justify-between mb-8">
                                    <Button
                                        variant="primary"
                                        size="btn-sm"
                                        onClick={() => router.visit(route('album.index'))}
                                        iconLeft={<FiChevronLeft size={16} />}
                                    >
                                        Kembali
                                    </Button>

                                    {isOwner ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-sm font-semibold text-gray-70">Visibilitas</span>
                                            <button
                                                onClick={handleToggleVisibility}
                                                className="flex items-center gap-2"
                                            >
                                                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${album.is_public ? 'bg-primary-100' : 'bg-gray-30'}`}>
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${album.is_public ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-70">
                                                    {album.is_public ? 'Publik' : 'Privat'}
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 overflow-hidden border-2 border-amber-200">
                                                <img
                                                    src={author.profile_path ? `/storage/${author.profile_path}` : '/images/defaults/avatar.png'}
                                                    alt={author.fullname}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-primary-100">{author.fullname}</p>
                                                <p className="text-xs text-gray-50">Pembuat Album</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Album Info */}
                                <h1 className="text-title md:text-hero font-extrabold text-primary-100 font-heading mb-4">
                                    {album.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-70 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <FiMapPin size={15} className="text-primary-85" />
                                        {album.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar size={15} className="text-primary-85" />
                                        {formatDate(album.date)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineEye size={15} className="text-primary-85" />
                                        Dilihat oleh {formatViews(album.view_count)} Nuravers
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                {isOwner && (
                                    <div className="flex items-center gap-3 mb-8 justify-end">
                                        <Button
                                            variant="secondary"
                                            size="btn-sm"
                                            iconLeft={<FiEdit2 size={15} />}
                                            onClick={() => router.visit(route('album.edit', album.id))}
                                        >
                                            Ubah Data
                                        </Button>
                                        <Button
                                            variant="error"
                                            size="btn-sm"
                                            iconLeft={<FiTrash2 size={15} />}
                                            onClick={handleDelete}
                                        >
                                            Hapus Album
                                        </Button>
                                    </div>
                                )}

                                {/* Photo Gallery */}
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {photos.map((photo, index) => (
                                            <div
                                                key={photo.id}
                                                onClick={() => openLightbox(index)}
                                                className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                                                    index === photos.length - 1 && photos.length % 2 !== 0 ? 'md:col-span-2' : ''
                                                }`}
                                            >
                                                <div className={`w-full ${index < 2 ? 'h-72' : 'h-56'} bg-gray-10 overflow-hidden`}>
                                                    <img
                                                        src={`/storage/${photo.photo_path}`}
                                                        alt={photo.filename}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-10">
                                        <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                                            <img src="/images/mascots/camera.png" alt="No photos" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-gray-50 text-sm">Belum ada foto dalam album ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

            {/* Lightbox Popup */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="fixed top-6 right-6 md:top-8 md:right-8 text-white hover:text-gray-300 transition-colors z-[100] cursor-pointer"
                        title="Tutup (Esc)"
                    >
                        <FiX size={32} />
                    </button>

                    {/* Prev button */}
                    {photos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                            className="absolute left-4 md:left-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                        >
                            <FiChevronLeft size={22} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={`/storage/${photos[lightboxIndex].photo_path}`}
                            alt={photos[lightboxIndex].filename}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                        />
                    </div>

                    {/* Next button */}
                    {photos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                            className="absolute right-4 md:right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                        >
                            <FiChevronRight size={22} />
                        </button>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">
                        {lightboxIndex + 1} / {photos.length}
                    </div>
                </div>
            )}
        </>
    );
}
