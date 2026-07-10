import { Link, Head } from '@inertiajs/react';
import { FaNewspaper, FaMapMarkedAlt, FaUsers, FaArrowLeft, FaSignOutAlt, FaTrophy, FaTag } from 'react-icons/fa';
import '@css/Init.css';
import '@css/Admin/Dashboard.css';

export default function Dashboard({ stats }) {
    // Fallback values if stats props are not provided
    const userCount = stats?.totalUsers ?? 0;
    const newsCount = stats?.totalNews ?? 0;
    const placeCount = stats?.totalPlaces ?? 0;
    const categoryCount = stats?.totalCategories ?? 0;

    return (
        <>
            <Head>
                <title>Admin | Dashboard Utama</title>
            </Head>

            <div className="admin-dashboard-container">
                {/* Back navigation */}
                <div className="dashboard-back-navigation">
                    <Link href={route('/')} className="back-to-home-link">
                        <FaArrowLeft style={{ marginRight: '0.5rem', fontSize: '0.9rem' }} /> Kembali ke Beranda Utama
                    </Link>
                </div>

                {/* Header */}
                <div className="dashboard-header">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="dashboard-mascot"
                    />
                    <div className="dashboard-title-wrapper">
                        <h1 className="dashboard-title">Dashboard Admin</h1>
                        <p className="dashboard-subtitle">
                            Selamat datang kembali di panel administrasi NuraLoka! Di sini Anda dapat mengelola wawasan wisata, destinasi perjalanan, serta memantau aktivitas traveler.
                        </p>
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper blue">
                            <FaUsers />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{userCount}</span>
                            <span className="stat-label">Total Pengguna</span>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper orange">
                            <FaNewspaper />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{newsCount}</span>
                            <span className="stat-label">Artikel Wawasan</span>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper green">
                            <FaMapMarkedAlt />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{placeCount}</span>
                            <span className="stat-label">Destinasi Terdaftar</span>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper purple">
                            <FaTag />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{categoryCount}</span>
                            <span className="stat-label">Kategori Aktif</span>
                        </div>
                    </div>
                </div>

                {/* Management Modules */}
                <div className="dashboard-menu-section">
                    <h2 className="section-heading">Menu Manajemen Utama</h2>
                    <div className="dashboard-menu-grid">
                        {/* Wawasan Wisata Card */}
                        <div className="dashboard-menu-card">
                            <div className="menu-card-body">
                                <FaNewspaper className="menu-card-icon" />
                                <h3 className="menu-card-title">Kelola Wawasan Wisata</h3>
                                <p className="menu-card-desc">
                                    Tulis, sunting, dan hapus artikel berita, tips liburan, rekomendasi kuliner, serta informasi sejarah kebudayaan lokal.
                                </p>
                            </div>
                            <div className="menu-card-action">
                                <Link
                                    href={route('admin.news.index')}
                                    className="menu-card-link"
                                >
                                    Buka Manajemen &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Destinasi Wisata Card */}
                        <div className="dashboard-menu-card">
                            <div className="menu-card-body">
                                <FaMapMarkedAlt className="menu-card-icon" />
                                <h3 className="menu-card-title">Kelola Destinasi &amp; Rute</h3>
                                <p className="menu-card-desc">
                                    Mengatur direktori objek wisata, tempat kuliner, pos transit, serta rute peta perjalanan antar kota di Indonesia.
                                </p>
                            </div>
                            <div className="menu-card-action">
                                <Link
                                    href={route('admin.places.index')}
                                    className="menu-card-link"
                                >
                                    Buka Manajemen &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Kategori Card */}
                        <div className="dashboard-menu-card">
                            <div className="menu-card-body">
                                <FaTag className="menu-card-icon" />
                                <h3 className="menu-card-title">Kelola Kategori</h3>
                                <p className="menu-card-desc">
                                    Atur klasifikasi destinasi wisata seperti Pantai, Pegunungan, Kuliner, dan lainnya beserta icon kategorinya.
                                </p>
                            </div>
                            <div className="menu-card-action">
                                <Link
                                    href={route('admin.categories.index')}
                                    className="menu-card-link"
                                >
                                    Buka Manajemen &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="dashboard-footer-actions">
                    <div className="dashboard-footer-left">
                        <Link href={route('/')} className="dashboard-public-link">
                            Lihat Halaman Publik
                        </Link>
                    </div>
                    <div className="dashboard-footer-right">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="btn-error"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FaSignOutAlt /> Keluar Sesi (Logout)
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
