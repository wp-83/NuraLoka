import { Link, Head, useForm } from '@inertiajs/react';
import { FaArrowLeft } from 'react-icons/fa';
// import '@css/Init.css';
import '@css/Admin/News.css';
import '@css/Admin/Place.css';

export default function Edit({ place, categories }) {
    // Pre-fill selected category IDs from the existing place data
    const existingCategoryIds = place.categories ? place.categories.map((c) => c.id) : [];

    const { data, setData, post, processing, errors } = useForm({
        name: place.name || '',
        description: place.description || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        address: place.address || '',
        categories: existingCategoryIds,
    });

    const toggleCategory = (id) => {
        const selected = data.categories.includes(id)
            ? data.categories.filter((c) => c !== id)
            : [...data.categories, id];
        setData('categories', selected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.places.update', place.id));
    };

    return (
        <>
            <Head>
                <title>Admin | Edit Destinasi Wisata</title>
            </Head>

            <div className="admin-form-container">
                {/* Back button */}
                <div className="back-navigation" style={{ marginBottom: '2rem' }}>
                    <Link href={route('admin.places.index')} className="back-to-home-link">
                        <FaArrowLeft style={{ fontSize: '0.9rem', marginRight: '0.5rem' }} /> Kembali ke Daftar Destinasi
                    </Link>
                </div>

                <div className="admin-form-card">
                    <h2 className="admin-form-title">Edit Destinasi Wisata</h2>

                    <form onSubmit={handleSubmit} className="admin-crud-form">
                        {/* Name */}
                        <div className="input-group">
                            <label htmlFor="name"><b>Nama Destinasi</b></label>
                            <div className={`input-wrapper ${errors.name ? 'input-error' : ''}`}>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Contoh: Pantai Bira, Taman Nasional Baluran..."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        {/* Address */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="address"><b>Alamat Lengkap</b></label>
                            <div className={`input-wrapper ${errors.address ? 'input-error' : ''}`}>
                                <input
                                    id="address"
                                    type="text"
                                    placeholder="Contoh: Jl. Pantai Bira, Kab. Bulukumba, Sulawesi Selatan"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.address && <span className="error-message">{errors.address}</span>}
                        </div>

                        {/* Latitude & Longitude */}
                        <div className="coord-row">
                            <div className="input-group">
                                <label htmlFor="latitude"><b>Latitude</b></label>
                                <div className={`input-wrapper ${errors.latitude ? 'input-error' : ''}`}>
                                    <input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        placeholder="-5.68432"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.latitude && <span className="error-message">{errors.latitude}</span>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="longitude"><b>Longitude</b></label>
                                <div className={`input-wrapper ${errors.longitude ? 'input-error' : ''}`}>
                                    <input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        placeholder="120.43281"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.longitude && <span className="error-message">{errors.longitude}</span>}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label><b>Kategori Destinasi</b></label>
                            <p style={{ fontSize: 'var(--text-small)', color: 'var(--gray-70)', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                                Pilih satu atau lebih kategori yang sesuai untuk destinasi ini.
                            </p>
                            {categories && categories.length > 0 ? (
                                <div className="category-checkbox-grid">
                                    {categories.map((cat) => {
                                        const isChecked = data.categories.includes(cat.id);
                                        return (
                                            <div
                                                key={cat.id}
                                                className={`category-checkbox-item ${isChecked ? 'checked' : ''}`}
                                                onClick={() => toggleCategory(cat.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`cat-${cat.id}`}
                                                    checked={isChecked}
                                                    onChange={() => toggleCategory(cat.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <label htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--gray-50)', fontStyle: 'italic', fontSize: 'var(--text-small)' }}>
                                    Belum ada kategori tersedia.
                                </p>
                            )}
                            {errors.categories && <span className="error-message">{errors.categories}</span>}
                        </div>

                        {/* Description */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="description"><b>Deskripsi Destinasi</b></label>
                            <div className={`textarea-wrapper ${errors.description ? 'input-error' : ''}`}>
                                <textarea
                                    id="description"
                                    placeholder="Tuliskan deskripsi lengkap tentang destinasi wisata ini..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <Link
                                href={route('admin.places.index')}
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
        </>
    );
}
