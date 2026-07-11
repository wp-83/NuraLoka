import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
// import '@css/Init.css';
import '@css/Admin/News.css';
import '@css/Admin/Place.css';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ places, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.places.index'), { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus destinasi wisata "${name}"?`)) {
            router.delete(route('admin.places.destroy', id));
        }
    };

    return (
        <>
            <Head>
                <title>Admin | Kelola Destinasi Wisata</title>
            </Head>

            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="admin-place-container">
                {/* Back navigation */}
                <div className="back-navigation">
                    <Link href={route('admin.dashboard')} className="back-to-home-link">
                        <FaArrowLeft style={{ fontSize: '0.9rem', marginRight: '0.5rem' }} /> Kembali ke Dashboard Admin
                    </Link>
                </div>

                {/* Header */}
                <div className="admin-place-header">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="admin-place-mascot"
                    />
                    <div className="admin-place-title-wrapper">
                        <h1 className="admin-place-title">Kelola Destinasi Wisata</h1>
                        <p className="admin-place-subtitle">
                            Tambah, ubah, dan hapus data destinasi wisata. Setiap destinasi dapat dihubungkan ke beberapa kategori.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="admin-toolbar">
                    <form onSubmit={handleSearch} className="admin-search-wrapper">
                        <div className="search-input-group">
                            <input
                                type="text"
                                placeholder="Cari destinasi berdasarkan nama atau alamat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </form>

                    <Link href={route('admin.places.create')} className="admin-add-place-btn">
                        <span className="add-place-icon-box">
                            <FaPlus />
                        </span>
                        <span>Tambah Destinasi</span>
                    </Link>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Nama Destinasi</th>
                                <th style={{ width: '25%' }}>Alamat</th>
                                <th style={{ width: '20%' }}>Koordinat</th>
                                <th style={{ width: '15%' }}>Kategori</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {places.data && places.data.length > 0 ? (
                                places.data.map((place) => (
                                    <tr key={place.id}>
                                        <td style={{ fontWeight: '600', color: 'var(--primary-100)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <FaMapMarkerAlt style={{ color: 'var(--error-DEFAULT)', flexShrink: 0 }} />
                                                {place.name}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-small)', color: 'var(--gray-70)' }}>
                                            {place.address}
                                        </td>
                                        <td>
                                            <span className="coord-display">
                                                {parseFloat(place.latitude).toFixed(5)}, {parseFloat(place.longitude).toFixed(5)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="category-badges">
                                                {place.categories && place.categories.length > 0 ? (
                                                    place.categories.map((cat) => (
                                                        <span key={cat.id} className="category-badge-chip">
                                                            {cat.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="category-badge-chip no-category">Tidak ada</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-actions" style={{ justifyContent: 'center' }}>
                                                <Link
                                                    href={route('admin.places.edit', place.id)}
                                                    className="btn-info btn-sm admin-action-btn edit-btn-icon-only"
                                                    title="Edit Destinasi"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(place.id, place.name)}
                                                    className="btn-error btn-sm admin-action-btn"
                                                    title="Hapus Destinasi"
                                                    type="button"
                                                >
                                                    <FaTrash /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-50)' }}>
                                        {search ? 'Tidak ada destinasi yang cocok dengan pencarian Anda.' : 'Belum ada data destinasi wisata.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {places.links && places.links.length > 3 && (
                    <div className="admin-pagination-wrapper">
                        <div className="news-pagination">
                            {places.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = 'Sebelumnya';
                                else if (label.includes('Next')) label = 'Selanjutnya';

                                if (!link.url) {
                                    return (
                                        <span
                                            key={index}
                                            className="pagination-link pagination-disabled"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`pagination-link ${link.active ? 'pagination-active' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <AdminLayout children={page}></AdminLayout>
