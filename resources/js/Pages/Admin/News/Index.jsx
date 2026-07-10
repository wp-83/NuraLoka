import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import '@css/Admin/News.css';

export default function Index({ news, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    // Format publish date to a clean Indonesian readable string
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Trigger search when search form is submitted
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.news.index'), { search }, { preserveState: true, replace: true });
    };

    // Clear search filter
    const handleClearSearch = () => {
        setSearch('');
        router.get(route('admin.news.index'), { search: '' }, { preserveState: true, replace: true });
    };

    // Trigger delete request
    const handleDelete = (id, title) => {
        if (confirm(`Apakah Anda yakin ingin menghapus wawasan wisata "${title}"?`)) {
            router.delete(route('admin.news.destroy', id), {
                onSuccess: () => {
                    // Flash will auto show from usePage().props.flash
                }
            });
        }
    };

    return (
        <>
            <Head>
                <title>Admin | Kelola Wawasan Wisata</title>
            </Head>

            {/* Flash Message Banner */}
            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="admin-news-container">
                {/* Back button to Admin Dashboard */}
                <div className="back-navigation">
                    <Link href={route('admin.dashboard')} className="back-to-home-link">
                        <FaArrowLeft style={{ fontSize: '0.9rem', marginRight: '0.5rem' }} /> Kembali ke Dashboard Admin
                    </Link>
                </div>

                {/* Header */}
                <div className="admin-news-header">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="admin-news-mascot"
                    />
                    <div className="admin-news-title-wrapper">
                        <h1 className="admin-news-title">Kelola Wawasan Wisata</h1>
                        <p className="admin-news-subtitle">
                            Halaman dashboard admin untuk menambah, mengubah, dan menghapus artikel wawasan wisata NuraLoka.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="admin-toolbar">
                    <form onSubmit={handleSearch} className="admin-search-wrapper">
                        <div className="search-input-group">
                            <input
                                type="text"
                                placeholder="Cari artikel berdasarkan judul atau konten..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </form>

                    <Link href={route('admin.news.create')} className="admin-add-news-btn">
                        <span className="add-news-icon-box">
                            <FaPlus />
                        </span>
                        <span className="add-news-text">Tambah Berita</span>
                    </Link>
                </div>

                {/* Table list */}
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Gambar</th>
                                <th style={{ width: '40%' }}>Judul</th>
                                <th style={{ width: '15%' }}>Penulis</th>
                                <th style={{ width: '20%' }}>Tanggal Rilis</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.data && news.data.length > 0 ? (
                                news.data.map((item) => {
                                    const authorName = item.user?.user_details?.fullname || item.user?.username || 'Admin';
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <img
                                                    src={item.thumbnail || '/images/defaults/image.png'}
                                                    alt={item.title}
                                                    className="admin-table-thumbnail"
                                                    onError={(e) => {
                                                        e.target.src = '/images/defaults/image.png';
                                                    }}
                                                />
                                            </td>
                                            <td style={{ fontWeight: '600', color: 'var(--primary-100)' }}>
                                                {item.title}
                                            </td>
                                            <td>{authorName}</td>
                                            <td>{formatDate(item.publish_date)}</td>
                                            <td>
                                                <div className="admin-actions" style={{ justifyContent: 'center' }}>
                                                    <Link
                                                        href={route('admin.news.edit', item.id)}
                                                        className="btn-info btn-sm admin-action-btn edit-btn-icon-only"
                                                        title="Edit Artikel"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.title)}
                                                        className="btn-error btn-sm admin-action-btn"
                                                        title="Hapus Artikel"
                                                        type="button"
                                                    >
                                                        <FaTrash /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-50)' }}>
                                        {search ? 'Tidak ada artikel yang cocok dengan pencarian Anda.' : 'Belum ada artikel wawasan wisata.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {news.links && news.links.length > 3 && (
                    <div className="admin-pagination-wrapper">
                        <div className="news-pagination">
                            {news.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    label = 'Sebelumnya';
                                } else if (label.includes('Next')) {
                                    label = 'Selanjutnya';
                                }

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
