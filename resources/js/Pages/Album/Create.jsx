import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import Button from '@components/Forms/Button';
import { FiChevronLeft, FiPlus, FiX } from 'react-icons/fi';

export default function AlbumCreate() {
    const [previewPhotos, setPreviewPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        location: '',
        date: '',
        is_public: true,
        photos: [], // Array of File objects
    });

    const maxDate = new Date().toISOString().split("T")[0];

    const handleToggleVisibility = () => {
        setData('is_public', !data.is_public);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('album.store'), {
            forceFormData: true,
        });
    };

    const handleAddPhotos = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Update form data with new files (append)
        const updatedFiles = [...data.photos, ...files];
        setData('photos', updatedFiles);

        // Generate previews
        const newPreviews = files.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file: file,
            preview: URL.createObjectURL(file),
            filename: file.name,
        }));

        setPreviewPhotos([...previewPhotos, ...newPreviews]);

        // Reset input
        e.target.value = '';
    };

    const handleRemovePhoto = (previewId, fileToRemove) => {
        // Remove from previews
        setPreviewPhotos(previewPhotos.filter(p => p.id !== previewId));

        // Remove from form data
        setData('photos', data.photos.filter(f => f !== fileToRemove));
    };

    return (
        <>
            <Head title={`NuraLoka | Buat Album Baru`}>
                <meta name="description" content="Buat album perjalanan wisata barumu." />
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
                                        onClick={() => router.visit(route('album.index'))}
                                        iconLeft={<FiChevronLeft size={16} />}
                                    >
                                        Batal & Kembali
                                    </Button>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-semibold text-gray-70">Visibilitas</span>
                                        <button
                                            type="button"
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

                                <h1 className="text-title md:text-hero font-extrabold text-primary-100 font-heading mb-8">
                                    Buat Album Baru
                                </h1>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Judul Album */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                            Judul Album <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                            placeholder="Masukkan judul album..."
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Lokasi & Tanggal */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                                Lokasi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                                placeholder="Contoh: Yogyakarta..."
                                            />
                                            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-85 mb-1.5 font-heading">
                                                Tanggal <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                max={maxDate}
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-30 bg-white text-sm text-gray-85 focus:outline-none focus:ring-2 focus:ring-primary-30 focus:border-primary-85 transition-colors"
                                            />
                                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                        </div>
                                    </div>

                                    {/* Daftar Foto */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-paragraph font-semibold text-gray-85 font-heading">
                                                Unggah Foto
                                            </h2>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="btn-sm"
                                                iconLeft={<FiPlus size={15} />}
                                                onClick={handleAddPhotos}
                                            >
                                                Pilih Foto
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

                                        {errors.photos && <p className="text-red-500 text-xs mb-3">{errors.photos}</p>}

                                        {previewPhotos.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {previewPhotos.map((photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-10 shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-10 flex-shrink-0">
                                                            <img
                                                                src={photo.preview}
                                                                alt={photo.filename}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-85 truncate">{photo.filename}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePhoto(photo.id, photo.file)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                                                            title="Batal unggah"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-30">
                                                <p className="text-gray-50 text-sm">Belum ada foto yang dipilih. Silakan tambah foto terlebih dahulu.</p>
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
                                            Simpan Album Baru
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
