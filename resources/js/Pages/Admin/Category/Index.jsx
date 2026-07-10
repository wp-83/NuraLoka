import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaTag } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
// import '@css/Init.css';
import '@css/Admin/News.css';
import '@css/Admin/Category.css';

export default function Index({ categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.categories.index'), { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (id, name, placesCount) => {
        if (placesCount > 0) {
            alert(`Kategori "${name}" tidak dapat dihapus karena masih digunakan oleh ${placesCount} destinasi.`);
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            router.delete(route('admin.categories.destroy', id));
        }
    };

    return (
        <>
            <Head>
                <title>Admin | Kelola Kategori Destinasi</title>
            </Head>

            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="admin-category-container">
                {/* Back navigation */}
                <div className="back-navigation">
                    <Link href={route('admin.dashboard')} className="back-to-home-link">
                        <FaArrowLeft style={{ fontSize: '0.9rem', marginRight: '0.5rem' }} /> Kembali ke Dashboard Admin
                    </Link>
                </div>

                {/* Header */}
                <div className="admin-category-header">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="admin-category-mascot"
                    />
                    <div className="admin-category-title-wrapper">
                        <h1 className="admin-category-title">Kelola Kategori Destinasi</h1>
                        <p className="admin-category-subtitle">
                            Tambah, ubah, dan hapus kategori destinasi wisata. Kategori digunakan untuk mengklasifikasi tempat-tempat di NuraLoka.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="admin-toolbar">
                    <form onSubmit={handleSearch} className="admin-search-wrapper">
                        <div className="search-input-group">
                            <input
                                type="text"
                                placeholder="Cari kategori berdasarkan nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </form>

                    <Link href={route('admin.categories.create')} className="admin-add-category-btn">
                        <span className="add-category-icon-box">
                            <FaPlus />
                        </span>
                        <span>Tambah Kategori</span>
                    </Link>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Icon</th>
                                <th style={{ width: '45%' }}>Nama Kategori</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>Jumlah Destinasi</th>
                                <th style={{ width: '25%', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data && categories.data.length > 0 ? (
                                categories.data.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            {cat.icon_path ? (
                                                <img
                                                    src={cat.icon_path}
                                                    alt={cat.name}
                                                    className="category-icon-cell"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="category-icon-placeholder">
                                                    <FaTag />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: '600', color: 'var(--primary-100)' }}>
                                            {cat.name}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`places-count-badge ${cat.places_count === 0 ? 'zero' : ''}`}>
                                                {cat.places_count} Destinasi
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-actions" style={{ justifyContent: 'center' }}>
                                                <Link
                                                    href={route('admin.categories.edit', cat.id)}
                                                    className="btn-info btn-sm admin-action-btn edit-btn-icon-only"
                                                    title="Edit Kategori"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name, cat.places_count)}
                                                    className="btn-error btn-sm admin-action-btn"
                                                    title={cat.places_count > 0 ? 'Tidak bisa dihapus — masih digunakan' : 'Hapus Kategori'}
                                                    type="button"
                                                    style={{ opacity: cat.places_count > 0 ? 0.5 : 1, cursor: cat.places_count > 0 ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <FaTrash /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-50)' }}>
                                        {search ? 'Tidak ada kategori yang cocok dengan pencarian Anda.' : 'Belum ada data kategori.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categories.links && categories.links.length > 3 && (
                    <div className="admin-pagination-wrapper">
                        <div className="news-pagination">
                            {categories.links.map((link, index) => {
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
