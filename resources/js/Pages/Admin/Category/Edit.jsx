import { Link, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowLeft, FaUpload, FaTrash, FaSearchPlus } from 'react-icons/fa';
// import '@css/Init.css';
import '@css/Admin/News.css';
import '@css/Admin/Category.css';

export default function Edit({ category }) {
    const [previewUrl, setPreviewUrl] = useState(category.icon_path || null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: category.name || '',
        icon_path: null,
        remove_icon: false,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData((d) => ({ ...d, icon_path: file, remove_icon: false }));
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(category.icon_path || null);
        }
    };

    const handleRemoveIcon = () => {
        setData((d) => ({ ...d, icon_path: null, remove_icon: true }));
        setPreviewUrl(null);
        const fileInput = document.getElementById('icon-file');
        if (fileInput) fileInput.value = '';
    };

    const triggerFileInput = () => {
        document.getElementById('icon-file')?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.update', category.id));
    };

    return (
        <>
            <Head>
                <title>Admin | Edit Kategori</title>
            </Head>

            <div className="admin-form-container">
                {/* Back button */}
                <div className="back-navigation" style={{ marginBottom: '2rem' }}>
                    <Link href={route('admin.categories.index')} className="back-to-home-link">
                        <FaArrowLeft style={{ fontSize: '0.9rem', marginRight: '0.5rem' }} /> Kembali ke Daftar Kategori
                    </Link>
                </div>

                <div className="admin-form-card">
                    <h2 className="admin-form-title">Edit Kategori</h2>

                    <form onSubmit={handleSubmit} className="admin-crud-form">
                        {/* Name */}
                        <div className="input-group">
                            <label htmlFor="name"><b>Nama Kategori</b></label>
                            <div className={`input-wrapper ${errors.name ? 'input-error' : ''}`}>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Contoh: Pantai, Pegunungan, Kuliner, Sejarah..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        {/* Icon Upload */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label><b>Icon Kategori</b></label>
                            <div className="thumbnail-upload-section">
                                {/* Preview Box */}
                                <div
                                    className={`icon-preview-box ${!previewUrl ? 'clickable-icon' : ''}`}
                                    onClick={!previewUrl ? triggerFileInput : undefined}
                                    style={{ cursor: !previewUrl ? 'pointer' : 'default' }}
                                >
                                    {previewUrl ? (
                                        <div className="preview-image-wrapper">
                                            <img
                                                src={previewUrl}
                                                alt="Icon Preview"
                                                style={{ objectFit: 'contain' }}
                                                onError={(e) => { e.target.src = '/images/defaults/image.png'; }}
                                            />
                                            <div className="preview-overlay">
                                                <button
                                                    type="button"
                                                    className="overlay-action-btn view-btn"
                                                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                                                    title="Lihat Icon"
                                                >
                                                    <FaSearchPlus />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="overlay-action-btn delete-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveIcon(); }}
                                                    title="Hapus Icon"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-icon">Belum ada icon</div>
                                    )}
                                </div>

                                {/* File Picker */}
                                <div className="file-input-wrapper">
                                    <div
                                        className={`select-wrapper ${errors.icon_path ? 'input-error' : ''}`}
                                        style={{ padding: '0', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={triggerFileInput}
                                    >
                                        <label
                                            htmlFor="icon-file"
                                            className="btn-white"
                                            style={{ border: 'none', margin: '0', borderRadius: '0', paddingBlock: '0.6rem', paddingInline: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-small)' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaUpload /> Pilih File Baru
                                        </label>
                                        <input
                                            id="icon-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ paddingInline: '1rem', fontSize: 'var(--text-small)', color: 'var(--gray-70)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {data.icon_path ? data.icon_path.name : 'Menggunakan icon saat ini'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-micro)', color: 'var(--gray-50)', marginTop: '0.5rem' }}>
                                        Biarkan kosong jika tidak ingin mengganti icon. Maks. 1MB.
                                    </span>
                                </div>
                            </div>
                            {errors.icon_path && <span className="error-message" style={{ marginTop: '0.5rem' }}>{errors.icon_path}</span>}
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <Link
                                href={route('admin.categories.index')}
                                className="btn-white btn-link-cancel"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="btn-success"
                                disabled={processing}
                            >
                                {processing ? 'Memperbarui...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image preview modal */}
            {isModalOpen && previewUrl && (
                <div className="image-popup-modal" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</div>
                        <img src={previewUrl} alt="Preview Icon" />
                    </div>
                </div>
            )}
        </>
    );
}
