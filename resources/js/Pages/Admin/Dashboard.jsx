import { Head, Link } from '@inertiajs/react';
import {
    FaArrowLeft,
    FaMapMarkedAlt,
    FaNewspaper,
    FaSignOutAlt,
    FaTag,
    FaUsers,
    FaMedal,
} from 'react-icons/fa';
import AdminLayout from '@js/Layouts/AdminLayout';

export default function Dashboard({ stats }) {
    const userCount = stats?.totalUsers ?? 0;
    const newsCount = stats?.totalNews ?? 0;
    const placeCount = stats?.totalPlaces ?? 0;
    const categoryCount = stats?.totalCategories ?? 0;

    const statistics = [
        {
            label: 'Total Pengguna',
            value: userCount,
            icon: FaUsers,
            iconClass: 'bg-info-light text-info-dark',
        },
        {
            label: 'Artikel Wawasan',
            value: newsCount,
            icon: FaNewspaper,
            iconClass: 'bg-warning-light text-warning-dark',
        },
        {
            label: 'Destinasi Terdaftar',
            value: placeCount,
            icon: FaMapMarkedAlt,
            iconClass: 'bg-success-light text-success-dark',
        },
        {
            label: 'Kategori Aktif',
            value: categoryCount,
            icon: FaTag,
            iconClass: 'bg-accent-10 text-accent',
        },
    ];

    const managementMenus = [
        {
            title: 'Kelola Wawasan Wisata',
            description:
                'Tulis, sunting, dan hapus artikel berita, tips liburan, rekomendasi kuliner, serta informasi sejarah kebudayaan lokal.',
            routeName: 'admin.news.index',
            icon: FaNewspaper,
        },
        {
            title: 'Kelola Destinasi & Rute',
            description:
                'Mengatur direktori objek wisata, tempat kuliner, pos transit, serta rute peta perjalanan antar kota di Indonesia.',
            routeName: 'admin.places.index',
            icon: FaMapMarkedAlt,
        },
        {
            title: 'Kelola Kategori',
            description:
                'Atur klasifikasi destinasi wisata seperti Pantai, Pegunungan, Kuliner, dan lainnya beserta ikon kategorinya.',
            routeName: 'admin.categories.index',
            icon: FaTag,
        },
        {
            title: 'Kelola Tantangan',
            description:
                'Atur daftar tantangan (missions) untuk para pengguna beserta poin reward dan lencana (badge) yang bisa didapatkan.',
            routeName: 'admin.missions.index',
            icon: FaMedal,
        },
    ];

    return (
        <>
            <Head title="Admin | Dasbor Utama" />

            <div
                className="
                    mx-auto flex w-full max-w-[1200px]
                    flex-col gap-10
                    px-6 py-12
                    animate-fade-in
                "
            >
                {/* Back Navigation */}
                <div className="flex justify-start">
                    <Link
                        href={route('home.index')}
                        className="
                            inline-flex items-center gap-2
                            font-body text-body font-semibold
                            text-primary
                            transition-all duration-200
                            hover:-translate-x-1
                            hover:text-primary-85
                        "
                    >
                        <FaArrowLeft className="text-small" />
                        Kembali ke Beranda Utama
                    </Link>
                </div>

                {/* Header */}
                <section
                    className="
                        flex flex-col items-center gap-6
                        rounded-2xl border border-primary-30
                        bg-secondary-10 p-6
                        shadow-[0_4px_20px_rgba(76,59,50,0.05)]

                        sm:flex-row
                        sm:p-8
                    "
                >
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="
                            h-[90px] w-[90px]
                            shrink-0 object-contain
                        "
                    />

                    <div className="flex-1 text-center sm:text-left">
                        <h1
                            className="
                                mb-2
                                font-heading text-title font-bold
                                text-primary-100
                            "
                        >
                            Dasbor Admin
                        </h1>

                        <p
                            className="
                                font-body text-body
                                leading-relaxed text-gray-70
                            "
                        >
                            Selamat datang kembali di panel administrasi
                            NuraLoka! Di sini Anda dapat mengelola wawasan
                            wisata, destinasi perjalanan, serta memantau
                            aktivitas traveler.
                        </p>
                    </div>
                </section>

                {/* Statistics */}
                <section
                    className="
                        grid grid-cols-1 gap-6
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >
                    {statistics.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="
                                    group flex items-center gap-5
                                    rounded-xl border border-primary-30
                                    bg-white p-6
                                    shadow-[0_4px_15px_rgba(0,0,0,0.02)]
                                    transition-all duration-300

                                    hover:-translate-y-1
                                    hover:shadow-[0_10px_25px_rgba(76,59,50,0.08)]
                                "
                            >
                                <div
                                    className={`
                                        flex h-12 w-12 shrink-0
                                        items-center justify-center
                                        rounded-lg text-2xl
                                        ${stat.iconClass}
                                    `}
                                >
                                    <Icon />
                                </div>

                                <div className="flex min-w-0 flex-col gap-1">
                                    <span
                                        className="
                                            font-heading text-[1.75rem]
                                            font-bold leading-tight
                                            text-primary-100
                                        "
                                    >
                                        {stat.value}
                                    </span>

                                    <span
                                        className="
                                            font-body text-micro
                                            font-medium text-gray-70
                                        "
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Management Menu */}
                <section className="flex flex-col gap-5">
                    <h2
                        className="
                            font-heading text-[1.4rem]
                            font-semibold text-primary-100
                        "
                    >
                        Menu Manajemen Utama
                    </h2>

                    <div
                        className="
                            grid grid-cols-1 gap-8
                            md:grid-cols-2
                            xl:grid-cols-3
                        "
                    >
                        {managementMenus.map((menu) => {
                            const Icon = menu.icon;

                            return (
                                <div
                                    key={menu.title}
                                    className="
                                        group relative
                                        flex min-h-[280px]
                                        flex-col justify-between
                                        gap-6 overflow-hidden
                                        rounded-2xl
                                        border border-primary-30
                                        bg-white p-8
                                        shadow-[0_4px_15px_rgba(0,0,0,0.02)]
                                        transition-all duration-300

                                        hover:-translate-y-1
                                        hover:border-primary-85
                                        hover:shadow-[0_15px_30px_rgba(76,59,50,0.1)]
                                    "
                                >
                                    <div className="flex flex-col gap-3">
                                        <Icon
                                            className="
                                                mb-2 text-[2.2rem]
                                                text-primary-100
                                                transition-transform duration-300
                                                group-hover:scale-110
                                            "
                                        />

                                        <h3
                                            className="
                                                font-heading
                                                text-[1.35rem]
                                                font-bold
                                                text-primary-100
                                            "
                                        >
                                            {menu.title}
                                        </h3>

                                        <p
                                            className="
                                                font-body text-small
                                                leading-relaxed
                                                text-gray-70
                                            "
                                        >
                                            {menu.description}
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Link
                                            href={menu.routeName ? route(menu.routeName) : ""}
                                            className="
                                                inline-flex items-center
                                                gap-1 py-2
                                                font-body text-body
                                                font-semibold
                                                text-primary-100
                                                transition-all duration-200

                                                hover:translate-x-1
                                                hover:text-primary-85
                                                hover:underline
                                            "
                                        >
                                            Buka Manajemen
                                            <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Footer Actions */}
                <footer
                    className="
                        mt-8 flex flex-col gap-4
                        border-t border-primary-30
                        pt-8

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    <Link
                        href={route('home.index')}
                        className="
                            inline-flex items-center
                            py-2
                            font-body text-body
                            font-semibold
                            text-primary-100
                            transition-all duration-200

                            hover:text-primary-85
                            hover:underline
                        "
                    >
                        Lihat Halaman Publik
                    </Link>

                    <Link
                        href={route('auth.logout')}
                        method="post"
                        as="button"
                        className="
                            inline-flex items-center
                            justify-center gap-2
                            rounded-xl
                            bg-error-dark
                            px-5 py-3
                            font-body text-btn-sm
                            font-semibold text-white
                            transition-all duration-200

                            hover:bg-error
                            active:scale-[0.98]
                        "
                    >
                        <FaSignOutAlt />
                        Keluar Sesi
                    </Link>
                </footer>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AdminLayout pageTitle="Dasbor" content={page}></AdminLayout>
