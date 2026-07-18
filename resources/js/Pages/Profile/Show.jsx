import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import ProfileStatisticCard from '@components/Features/ProfileStatisticCard';
import { useTranslation } from '@js/i18n';
import { FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';
import { FaGenderless, FaMars, FaVenus } from 'react-icons/fa6';

// =========================================================
// FORMATTER
// =========================================================
const formatDate = (date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function Show({ targetUser, totalUser, rank, totalBadge, statistics, recentBadges }) {
    const { t } = useTranslation();
    return (
        <section className="w-full py-8">
            {/* BACK BUTTON */}
            <div className="mb-6">
                <Link
                    href={route('challenge.leaderboard')}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-85 transition-colors font-medium text-sm"
                >
                    <span className="mr-2">‹</span> {t('challenge.leaderboard_page_title')}
                </Link>
            </div>

            {/* PAGE TITLE */}
            <h1 className="mb-8 font-heading text-title font-bold text-primary sm:text-hero">
                Profil {targetUser.user_detail?.fullname}
            </h1>

            {/* PROFILE */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                {/* LEFT SIDE */}
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start lg:gap-8">

                    {/* AVATAR */}
                    <div className="h-44 w-44 shrink-0 overflow-hidden rounded-full border-3 border-secondary bg-white p-1 shadow-sm sm:h-48 sm:w-48">
                        <img
                            src={targetUser.public_profile_photo}
                            alt={targetUser.user_detail?.fullname}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </div>

                    {/* USER DATA */}
                    <div className="w-full text-center sm:text-left">
                        <h2 className="font-heading text-subtitle text-primary">
                            {targetUser.user_detail?.fullname}
                        </h2>
                        <p className="mt-1 font-heading text-body text-secondary">
                            {t('common.community')}
                        </p>

                        {/* PROFILE INFORMATION */}
                        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-left sm:grid-cols-2">
                            <div className="flex min-w-0 items-center gap-2 font-body text-body text-gray-100">
                                <FiUser size={24} className='text-accent'></FiUser>
                                <span className="truncate">{targetUser.username}</span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 font-body text-body text-gray-100">
                                <FiCalendar size={24} className='text-accent'></FiCalendar>
                                <span className="truncate">{formatDate(targetUser.user_detail?.dob)}</span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 font-body text-body text-gray-100">
                                <FiMapPin size={24} className='text-accent'></FiMapPin>
                                <span className="truncate">{targetUser.user_detail?.province?.name ?? '-'}</span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 font-body text-body text-gray-100">
                                {targetUser.user_detail?.gender === 'male' ? (
                                    <FaMars size={24} className="text-accent" />
                                ) : targetUser.user_detail?.gender === 'female' ? (
                                    <FaVenus size={24} className="text-accent" />
                                ) : (
                                    <FaGenderless size={24} className="text-accent" />
                                )}

                                <span className="truncate">
                                    {targetUser.user_detail?.gender === 'male' ? (
                                        t('profile.gender_male')
                                    ) : targetUser.user_detail?.gender === 'female' ? (
                                        t('profile.gender_female')
                                    ) : (
                                        t('profile.gender_unspecified')
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex w-full flex-row items-start justify-between gap-8 border-t border-gray-30 pt-6 lg:w-auto lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                    {/* RANK */}
                    <div className="text-left lg:text-right">
                        <p className="font-heading text-subtitle font-bold text-accent sm:text-title">
                            #{rank}
                        </p>
                        <p className="font-body text-paragraph text-primary-100">
                            {t('profile.rank_of', { total: totalUser })}
                        </p>
                    </div>

                    {/* TOTAL POINTS */}
                    <div className="text-right">
                        <p className="font-heading text-subtitle font-bold text-secondary sm:text-title">
                            {(targetUser.user_detail?.total_points ?? 0).toLocaleString('id-ID')}
                        </p>
                        <p className="font-body text-paragraph text-primary-100">
                            {t('common.points_nura')}
                        </p>
                    </div>

                    {/* RECENT BADGES */}
                    <div className="text-right hidden lg:block">
                        <p className="mb-3 font-body text-body text-primary-100">
                            {t('profile.recent_badges')}
                        </p>

                        {recentBadges?.length > 0 ? (
                            <div className="flex justify-end gap-3">
                                {recentBadges.map((badge) => (
                                    <img
                                        key={badge.id}
                                        src={`/${badge.icon_path}`}
                                        alt={badge.name}
                                        title={badge.name}
                                        className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="font-body text-small text-gray-70 italic">{t('profile.no_badges')}</p>
                        )}
                    </div>
                </div>

                {/* RECENT BADGES FOR MOBILE */}
                <div className="mt-6 text-center block lg:hidden">
                    <p className="mb-3 font-body text-body text-primary-100">
                        {t('profile.recent_badges')}
                    </p>

                    {recentBadges?.length > 0 ? (
                        <div className="flex justify-center gap-3">
                            {recentBadges.map((badge) => (
                                <img
                                    key={badge.id}
                                    src={`/${badge.icon_path}`}
                                    alt={badge.name}
                                    title={badge.name}
                                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="font-body text-small text-gray-70 italic">{t('profile.no_badges')}</p>
                    )}
                </div>
            </div>

            {/* STATISTICS */}
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                <ProfileStatisticCard
                    title={t('profile.stat_badges')}
                    value={statistics?.badges ?? 0}
                    description={t('profile.stat_badges_desc', { total: totalBadge })}
                    image="/images/badges/siPalingBudaya/4.png"
                />
                <ProfileStatisticCard
                    title={t('profile.stat_albums')}
                    value={statistics?.albums ?? 0}
                    description={t('profile.stat_albums_desc', { year: new Date().getFullYear() })}
                    image="/images/mascots/map-v2.png"
                />
                <ProfileStatisticCard
                    title={t('profile.stat_points')}
                    value={(targetUser.user_detail?.total_points ?? 0).toLocaleString('id-ID')}
                    description={t('profile.stat_points_desc')}
                    image="/images/mascots/telescope.png"
                    flipImage={true}
                />
            </div>
        </section>
    );
}


// =========================================================
// LAYOUT
// =========================================================
Show.layout = (page) => (
    <MainLayout
        pageTitle="Profil Pengguna"
        pageDescription="Lihat profil pengguna NuraLoka."
        content={page}
    />
);
