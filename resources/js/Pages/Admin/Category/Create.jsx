import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowLeft, FaUpload, FaTrash, FaSearchPlus } from 'react-icons/fa';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        icon_path: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('icon_path', file);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleRemoveIcon = () => {
        setData('icon_path', null);
        setPreviewUrl(null);
        const fileInput = document.getElementById('icon-file');
        if (fileInput) fileInput.value = '';
    };

    const triggerFileInput = () => {
        document.getElementById('icon-file')?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'));
    };

    return (
        <>
            <Head>
                <title>Admin | Tambah Kategori</title>
            </Head>

            <div className="mx-auto w-full max-w-3xl">
                {/* Back button */}
                <div className="mb-6">
                    <Button
                        variant="white"
                        size="btn-sm"
                        iconLeft={<FaArrowLeft />}
                        onClick={() => router.get(route('admin.categories.index'))}
                    >
                        Kembali ke Daftar Kategori
                    </Button>
                </div>

                <h2 className="mb-6 border-b border-primary-10 pb-4 font-heading text-subtitle font-bold text-primary-100">
                    Tambah Kategori Baru
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Input
                        label="Nama Kategori"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: Pantai, Pegunungan, Kuliner, Sejarah..."
                        error={errors.name}
                        required
                    />

                    {/* Icon Upload */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-heading text-paragraph text-primary-100">
                            Icon Kategori
                        </label>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            {/* Preview Box */}
                            <div
                                className={`group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed ${
                                    errors.icon_path ? 'border-error-dark' : 'border-primary-30'
                                } bg-gray-10 ${!previewUrl ? 'cursor-pointer hover:bg-secondary-10' : ''}`}
                                onClick={!previewUrl ? triggerFileInput : undefined}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Icon Preview"
                                            className="h-full w-full object-contain p-2"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsPreviewOpen(true)}
                                                title="Lihat Icon"
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-100 hover:opacity-80"
                                            >
                                                <FaSearchPlus />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveIcon}
                                                title="Hapus Icon"
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-error-dark hover:opacity-80"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <span className="px-2 text-center text-micro italic text-gray-50">
                                        Belum ada icon
                                    </span>
                                )}
                            </div>

                            {/* File Picker */}
                            <div className="flex flex-col gap-2">
                                <input
                                    id="icon-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="white"
                                        size="btn-sm"
                                        iconLeft={<FaUpload />}
                                        onClick={triggerFileInput}
                                    >
                                        Pilih File
                                    </Button>
                                    <span className="max-w-[12rem] truncate text-small text-gray-70">
                                        {data.icon_path ? data.icon_path.name : 'Tidak ada berkas dipilih'}
                                    </span>
                                </div>
                                <span className="text-micro text-gray-50">
                                    Format: JPG, PNG, WEBP, SVG, atau GIF (Maks. 1MB). Opsional.
                                </span>
                            </div>
                        </div>

                        {errors.icon_path && (
                            <p className="text-small italic text-error-dark">{errors.icon_path}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex justify-end gap-3 border-t border-primary-10 pt-5">
                        <Button
                            variant="white"
                            onClick={() => router.get(route('admin.categories.index'))}
                        >
                            Batal
                        </Button>
                        <Button variant="success" type="submit" loading={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Image preview overlay */}
            {isPreviewOpen && previewUrl && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-100 shadow-md hover:opacity-80"
                        >
                            &times;
                        </button>
                        <img
                            src={previewUrl}
                            alt="Preview Icon"
                            className="max-h-[80vh] max-w-[80vw] rounded-lg bg-white object-contain p-4"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

Create.layout = (page) => <AdminLayout content={page}></AdminLayout>;
