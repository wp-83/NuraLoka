import BrandText from '@components/Common/BrandText';
import EmptyState from '@components/Common/EmptyState';
import UserStatisticCard from '@components/Features/UserStatisticCard';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';
import {
    FaMapMarkedAlt,
    FaNewspaper,
    FaTag,
    FaMedal,
    FaTasks,
    FaLayerGroup,
    FaDownload,
    FaUsers,
    FaExclamationTriangle,
} from 'react-icons/fa';
import AdminLayout from '@js/Layouts/AdminLayout';
import { mediaUrl } from '@js/mediaUrl';

function formatDate(dateString) {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function Dashboard({ stats, recentUsers = [], recentNews = [] }) {
    const { t } = useTranslation();

    const statistics = [
        {
            label: t('admin.dashboard.stat_users'),
            value: stats?.totalUsers ?? 0,
            icon: <FaUsers size={24} />,
            variant: 'primary',
        },
        {
            label: t('admin.dashboard.stat_news'),
            value: stats?.totalNews ?? 0,
            icon: <FaNewspaper size={24} />,
            variant: 'yellow',
        },
        {
            label: t('admin.dashboard.stat_places'),
            value: stats?.totalPlaces ?? 0,
            icon: <FaMapMarkedAlt size={24} />,
            variant: 'green',
        },
        {
            label: t('admin.dashboard.stat_categories'),
            value: stats?.totalCategories ?? 0,
            icon: <FaTag size={24} />,
            variant: 'accent',
        },
    ];

    const quickStats = [
        { label: t('admin.dashboard.quick_badges'), value: stats?.totalBadges ?? 0, icon: <FaMedal /> },
        { label: t('admin.dashboard.quick_missions'), value: stats?.totalMissions ?? 0, icon: <FaTasks /> },
        { label: t('admin.dashboard.quick_banned'), value: stats?.totalBannedUsers ?? 0, icon: <FaUsers /> },
    ];

    const managementMenus = [
        {
            title: t('admin.dashboard.menu_news_title'),
            description: t('admin.dashboard.menu_news_description'),
            routeName: 'admin.news.index',
            icon: FaNewspaper,
        },
        {
            title: t('admin.dashboard.menu_places_title'),
            description: t('admin.dashboard.menu_places_description'),
            routeName: 'admin.places.index',
            icon: FaMapMarkedAlt,
        },
        {
            title: t('admin.dashboard.menu_osm_title'),
            description: t('admin.dashboard.menu_osm_description'),
            routeName: 'admin.osm-import.index',
            icon: FaDownload,
        },
        {
            title: t('admin.dashboard.menu_categories_title'),
            description: t('admin.dashboard.menu_categories_description'),
            routeName: 'admin.categories.index',
            icon: FaTag,
        },
        {
            title: t('admin.dashboard.menu_missions_title'),
            description: t('admin.dashboard.menu_missions_description'),
            routeName: 'admin.missions.index',
            icon: FaTasks,
        },
        {
            title: t('admin.dashboard.menu_badges_title'),
            description: t('admin.dashboard.menu_badges_description'),
            routeName: 'admin.badges.index',
            icon: FaMedal,
        },
        {
            title: t('admin.dashboard.menu_levels_title'),
            description: t('admin.dashboard.menu_levels_description'),
            routeName: 'admin.levels.index',
            icon: FaLayerGroup,
        },
        {
            title: t('admin.dashboard.menu_users_title'),
            description: t('admin.dashboard.menu_users_description'),
            routeName: 'admin.users.index',
            icon: FaUsers,
        },
    ];

    const hasActiveImports = (stats?.activeImports ?? 0) > 0;

    return (
        <div
            className="
                flex w-full flex-col gap-10
                animate-fade-in
            "
        >
            {/* Header */}
            <section
                className="
                    flex flex-col items-center gap-6
                    rounded-xl bg-accent-10 py-4 px-8
                    shadow-sm

                    sm:flex-row
                "
            >
                <img
                    src="/images/mascots/welcome.png"
                    alt="NuraLoka Mascot"
                    className="
                        h-32
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
                        {t('admin.dashboard.title')}
                    </h1>

                    <p
                        className="
                            font-body text-body
                            leading-relaxed text-gray-70
                        "
                    >
                        <BrandText text={t('admin.dashboard.welcome')} />
                    </p>
                </div>
            </section>

            {/* Active Import Notice */}
            {hasActiveImports && (
                <Link
                    href={route('admin.osm-import.index')}
                    className="
                        flex flex-col items-start gap-3
                        rounded-xl border border-warning-dark/30
                        bg-warning-light p-4
                        transition-colors

                        sm:flex-row sm:items-center sm:justify-between
                        hover:bg-warning-light/70
                    "
                >
                    <span className="flex items-center gap-3 font-body text-body text-gray-85">
                        <FaExclamationTriangle className="shrink-0 text-warning-dark" />
                        {t('admin.dashboard.active_import_notice', {
                            count: stats.activeImports,
                        })}
                    </span>

                    <span className="font-body text-small font-semibold text-primary-100 underline">
                        {t('admin.dashboard.active_import_cta')}
                    </span>
                </Link>
            )}

            {/* Statistics */}
            <section className="flex flex-col gap-4">
                <div
                    className="
                        grid grid-cols-1 gap-4
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >
                    {statistics.map((stat) => (
                        <UserStatisticCard
                            key={stat.label}
                            title={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            variant={stat.variant}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap gap-3">
                    {quickStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm"
                        >
                            <span className="text-primary-70">{stat.icon}</span>

                            <span className="font-heading text-body font-bold text-primary-100">
                                {stat.value}
                            </span>

                            <span className="font-body text-small text-gray-70">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Users */}
                <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-paragraph font-bold text-primary-100">
                            {t('admin.dashboard.recent_users_heading')}
                        </h2>

                        <Link
                            href={route('admin.users.index')}
                            className="font-body text-small font-semibold text-primary-100 hover:underline"
                        >
                            {t('admin.dashboard.view_all')}
                        </Link>
                    </div>

                    {recentUsers.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <img
                                        src={user.public_profile_photo}
                                        alt={user.username}
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-body text-body text-gray-100">
                                            {user.fullname ?? user.username}
                                        </p>

                                        <p className="font-body text-micro text-gray-50">
                                            {t('admin.dashboard.joined_at', {
                                                date: formatDate(user.created_at),
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('admin.dashboard.recent_users_empty')}
                            size="compact"
                        />
                    )}
                </div>

                {/* Recent News */}
                <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-paragraph font-bold text-primary-100">
                            {t('admin.dashboard.recent_news_heading')}
                        </h2>

                        <Link
                            href={route('admin.news.index')}
                            className="font-body text-small font-semibold text-primary-100 hover:underline"
                        >
                            {t('admin.dashboard.view_all')}
                        </Link>
                    </div>

                    {recentNews.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {recentNews.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <img
                                        src={mediaUrl(item.thumbnail) || '/images/defaults/image.png'}
                                        alt={item.title}
                                        className="h-10 w-14 shrink-0 rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.src = '/images/defaults/image.png';
                                        }}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-body text-body text-gray-100">
                                            {item.title}
                                        </p>

                                        <p className="font-body text-micro text-gray-50">
                                            {formatDate(item.publish_date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('admin.dashboard.recent_news_empty')}
                            size="compact"
                        />
                    )}
                </div>
            </section>

            {/* Management Menu */}
            <section className="flex flex-col gap-5">
                <h2
                    className="
                        font-heading text-subtitle
                        font-bold text-primary-100
                    "
                >
                    {t('admin.dashboard.menu_heading')}
                </h2>

                <div
                    className="
                        grid grid-cols-1 gap-6
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
                                    flex min-h-[260px]
                                    flex-col justify-between
                                    gap-6 overflow-hidden
                                    rounded-xl
                                    bg-white p-6
                                    shadow-sm
                                    transition-all duration-300

                                    hover:-translate-y-1
                                    hover:shadow-md
                                "
                            >
                                <div className="flex flex-col gap-3">
                                    <Icon
                                        className="
                                            mb-2 text-[2rem]
                                            text-primary-100
                                            transition-transform duration-300
                                            group-hover:scale-110
                                        "
                                    />

                                    <h3
                                        className="
                                            font-heading
                                            text-paragraph
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
                                        href={route(menu.routeName)}
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
                                        {t('admin.dashboard.menu_open')}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

Dashboard.layout = (page) => (
    <AdminLayout pageTitle="title.admin_dashboard" content={page} />
);
