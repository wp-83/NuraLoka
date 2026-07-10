import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import Button from '@components/Forms/Button';
import { FiSearch, FiX, FiEye, FiEdit2, FiTrash2, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
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

// Kartu album populer
function PopularAlbumCard({ album }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col">
            <div className="relative h-44 overflow-hidden">
                <img
                    src={album.thumbnail ? `/storage/${album.thumbnail}` : '/images/defaults/avatar.png'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-heading font-bold text-sm text-gray-85 mb-2 line-clamp-2 leading-snug">
                    {album.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-50 mb-1">
                    <FiUsers size={12} />
                    <span>{album.author_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-50 mb-3">
                    <HiOutlineEye size={12} />
                    <span>{formatViews(album.view_count)} dilihat</span>
                </div>
                <div className="mt-auto">
                    <Button
                        variant="primary"
                        size="btn-sm"
                        onClick={() => router.visit(route('album.show', album.id))}
                    >
                        Lihat Album
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Kartu album milik user
function MyAlbumCard({ album, onDelete }) {
    const handleToggleVisibility = (e) => {
        e.stopPropagation();
        router.post(route('album.toggle.visibility', album.id), {}, { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={album.thumbnail ? `/storage/${album.thumbnail}` : '/images/defaults/avatar.png'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                />
            </div>
            <div className="p-4">
                <h3 className="font-heading font-bold text-sm text-gray-85 mb-2 line-clamp-2 leading-snug">
                    {album.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-50 mb-2">
                    <span className="flex items-center gap-1">
                        <FiMapPin size={11} />
                        {album.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiCalendar size={11} />
                        {formatDate(album.date)}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-85 font-medium">
                        <HiOutlineEye size={15} className="text-[#209B8B]" />
                        <span>Dilihat oleh {formatViews(album.view_count)} Nuravers</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Toggle */}
                        <button
                            onClick={handleToggleVisibility}
                            className="flex items-center gap-2"
                            title="Klik untuk ganti visibilitas"
                        >
                            <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${album.is_public ? 'bg-[#8B5E3C]' : 'bg-gray-30'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${album.is_public ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-xs font-bold text-[#1F1F1F]">
                                {album.is_public ? 'Publik' : 'Privat'}
                            </span>
                        </button>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => router.visit(route('album.show', album.id))}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-[#209B8B] text-white hover:opacity-80 transition-opacity shadow-sm"
                                title="Lihat Detail"
                            >
                                <HiOutlineEye size={14} />
                            </button>
                            <button
                                onClick={() => router.visit(route('album.edit', album.id))}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-[#428845] text-white hover:opacity-80 transition-opacity shadow-sm"
                                title="Edit"
                            >
                                <FiEdit2 size={13} />
                            </button>
                            <button
                                onClick={() => onDelete(album.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-[#D32F2F] text-white hover:opacity-80 transition-opacity shadow-sm"
                                title="Hapus"
                            >
                                <FiTrash2 size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hasil pencarian user
function UserSearchResult({ user }) {
    return (
        <div className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-10 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-amber-100 overflow-hidden flex-shrink-0 border-2 border-amber-200">
                <img
                    src={user.profile_path ? `/storage/${user.profile_path}` : '/images/defaults/avatar.png'}
                    alt={user.fullname}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-base text-primary-100">{user.fullname}</h3>
                <p className="text-sm text-gray-50">{user.province}</p>
            </div>
            <Button
                variant="primary"
                size="btn-sm"
                onClick={() => router.visit(route('album.user.albums', user.id))}
            >
                Lihat Album
            </Button>
        </div>
    );
}

export default function AlbumIndex({ popularAlbums = [], myAlbums = [], totalMyAlbums = 0, searchResults = null, searchQuery = '' }) {
    const [search, setSearch] = useState(searchQuery);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.get(route('album.index'), { search: search.trim() }, { preserveState: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('album.index'));
    };

    const handleDelete = (albumId) => {
        if (confirm('Yakin ingin menghapus album ini?')) {
            router.delete(route('album.destroy', albumId));
        }
    };

    return (
        <>
            <Head title="NuraLoka | Album">
                <meta name="description" content="Album perjalanan wisata kamu dan komunitas Nuravers." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans">
                <Navbar />

                <main className="flex-1">
                    {/* ── Header ── */}
                    <section className="container mx-auto px-4 md:px-6 lg:px-8 pt-10 pb-4">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src="/images/mascots/camera.png"
                                            alt="Mascot"
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-title md:text-hero font-extrabold text-primary-100 font-heading">
                                            Album Nuravers
                                        </h1>
                                        <p className="text-body text-primary-70 font-medium font-heading italic">
                                            Albumipun Nuravers
                                        </p>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <form onSubmit={handleSearch} className="relative mt-6 mb-8">
                                    <div className="flex items-center bg-white rounded-xl border border-gray-30 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="pl-4 text-gray-50">
                                            <FiSearch size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Masukkan nama Nuravers lain untuk melihat koleksi album mereka..."
                                            className="w-full px-3 py-3 text-sm text-gray-85 bg-transparent outline-none border-none focus:ring-0"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="pr-4 text-gray-50 hover:text-gray-85 transition-colors"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* ── Search Results (Gambar 5) ── */}
                                {searchResults !== null ? (
                                    <div className="mb-10">
                                        <p className="text-sm text-gray-50 text-right mb-4">
                                            Ditemukan {searchResults.length} hasil
                                        </p>
                                        {searchResults.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {searchResults.map((user) => (
                                                    <UserSearchResult key={user.id} user={user} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                                                    <img src="/images/mascots/wait.png" alt="No result" className="w-full h-full object-contain" />
                                                </div>
                                                <p className="text-gray-50 text-sm">Tidak ditemukan Nuravers dengan nama tersebut.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* ── Album Populer Minggu Ini ── */}
                                        <section className="mb-10">
                                            <div className="bg-gradient-to-r from-primary-10 to-amber-50 rounded-2xl p-6 border border-primary-30/30">
                                                <h2 className="text-subtitle font-bold text-primary-100 font-heading mb-5">
                                                    Album Populer Minggu Ini
                                                </h2>
                                                {popularAlbums.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                                        {popularAlbums.map((album) => (
                                                            <PopularAlbumCard key={album.id} album={album} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-50 text-center py-8">
                                                        Belum ada album populer minggu ini.
                                                    </p>
                                                )}
                                            </div>
                                        </section>

                                        {/* ── Album Kamu ── */}
                                        <section className="mb-10">
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-subtitle font-bold text-primary-100 font-heading">
                                                    Album Kamu
                                                </h2>
                                                <Button
                                                    variant="primary"
                                                    size="btn-sm"
                                                    onClick={() => router.visit(route('album.create'))}
                                                >
                                                    Tambah Album Baru
                                                </Button>
                                            </div>

                                            {myAlbums.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    {myAlbums.map((album) => (
                                                        <MyAlbumCard key={album.id} album={album} onDelete={handleDelete} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-10">
                                                    <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                                                        <img src="/images/mascots/wait.png" alt="No albums" className="w-full h-full object-contain" />
                                                    </div>
                                                    <p className="text-gray-50 text-sm mb-2">Kamu belum memiliki album.</p>
                                                    <p className="text-gray-30 text-xs">Ayo mulai dokumentasikan perjalananmu!</p>
                                                </div>
                                            )}

                                            {myAlbums.length > 0 && (
                                                <div className="flex justify-end mt-6">
                                                    <Button
                                                        variant="primary"
                                                        size="btn-sm"
                                                        onClick={() => router.visit(route('album.all'))}
                                                    >
                                                        Lihat Semua Album
                                                    </Button>
                                                </div>
                                            )}
                                        </section>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
