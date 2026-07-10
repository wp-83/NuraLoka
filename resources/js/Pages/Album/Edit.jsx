import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import Button from '@/Components/Forms/Button';
import { FiChevronLeft, FiPlus, FiX } from 'react-icons/fi';

export default function AlbumEdit({ album, photos: initialPhotos = [] }) {
    const [photos, setPhotos] = useState(initialPhotos);
    const [newPhotos, setNewPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const { data, setData, put, processing } = useForm({
        title: album.title || '',
        location: album.location || '',
        date: album.date || '',
        is_public: album.is_public ?? true,
    });

    const maxDate = new Date().toISOString().split("T")[0];

    const handleToggleVisibility = () => {
        router.post(route('album.toggle.visibility', album.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setData('is_public', !data.is_public);
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('album.update', album.id));
    };

    const handleRemovePhoto = (photoId) => {
        if (confirm('Yakin ingin menghapus foto ini?')) {
            router.delete(route('album.photo.remove', photoId), {
                preserveScroll: true,
                onSuccess: () => {
                    setPhotos(photos.filter(p => p.id !== photoId));
                },
            });
        }
    };

    const handleAddPhotos = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos[]', files[i]);
        }

        router.post(route('album.photo.add', album.id), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                // Page will refresh with updated photos
            },
        });

        // Reset file input
        e.target.value = '';
    };

    return (
        <>
            <Head title={`NuraLoka | Edit Album`}>
                <meta name="description" content="Edit album perjalanan wisata kamu." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12">
                                {/* Top bar */}
                                <div className="flex items-center justify-between mb-8">
                                    <Button
                                        variant="primary"
                                        size="btn-sm"
                                        onClick={() => router.visit(route('album.show', album.id))}
                                        iconLeft={<FiChevronLeft size={16} />}
                                    >
                                        Kembali
                                    </Button>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-semibold text-gray-70">Visibilitas</span>
                                        <button
                                            onClick={handleToggleVisibility}
                                            className="flex items-center gap-2"
                                        >
                                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${data.is_public ? 'bg-primary-100' : 'bg-gray-30'}`}>
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${data.is_public ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-70">
                                                {data.is_public ? 'Publik' : 'Privat'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Judul Album */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                            Judul Album
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                            placeholder="Masukkan judul album..."
                                        />
                                    </div>

                                    {/* Lokasi & Tanggal */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                                Lokasi
                                            </label>
                                            <input
                                                type="text"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                                placeholder="Lokasi..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                                Tanggal
                                            </label>
                                            <input
                                                type="date"
                                                max={maxDate}
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Daftar Foto */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-paragraph font-semibold text-gray-85 font-heading">
                                                Daftar Foto
                                            </h2>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="btn-sm"
                                                iconLeft={<FiPlus size={15} />}
                                                onClick={handleAddPhotos}
                                            >
                                                Tambah Foto
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        {photos.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {photos.map((photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-10 shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-10 flex-shrink-0">
                                                            <img
                                                                src={`/storage/${photo.photo_path}`}
                                                                alt={photo.filename}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = '/images/defaults/avatar.png'; }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-85 truncate">{photo.filename}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePhoto(photo.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                                                            title="Hapus foto"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-10">
                                                <p className="text-gray-50 text-sm">Belum ada foto. Tambahkan foto untuk album ini.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="btn-md"
                                            loading={processing}
                                            disabled={processing}
                                        >
                                            Simpan Perubahan
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
