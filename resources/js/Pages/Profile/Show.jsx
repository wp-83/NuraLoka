import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import BadgeIcon from '@components/Common/BadgeIcon';
import Button from '@components/Forms/Button';
import AlbumCard from '@components/Features/AlbumCard';
import ProfileStatisticCard from '@components/Features/ProfileStatisticCard';
import { useTranslation } from '@js/i18n';
import { FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';
import { FaGenderless, FaMars, FaVenus } from 'react-icons/fa6';
import { IoChevronBackSharp } from 'react-icons/io5';

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
export default function Show({ targetUser, totalUser, rank, totalBadge, statistics, recentBadges, allBadges, albums }) {
    const { t } = useTranslation();
    return (
        <section className="w-full py-8">
            {/* BACK BUTTON */}
            <div className="mb-6">
                <Link href={route('challenge.leaderboard')}>
                    <Button iconLeft={<IoChevronBackSharp />}>
                        {t('challenge.leaderboard_page_title')}
                    </Button>
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
                        {/* Gelar level user — sama seperti di profil sendiri
                            (Profile/Index) dan di leaderboard, agar satu user
                            selalu disebut dengan gelar yang sama di mana pun. */}
                        <p className="mt-1 font-heading text-body text-secondary">
                            {targetUser.user_detail?.level?.name
                                || t('common.community')}
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

                </div>
            </div>

            {/* PUBLIC PROFILE: ALBUMS & BADGES */}
            <div className="mt-10 border-t border-gray-30 pt-8">
                <div className="mb-8">
                    <h2 className="font-heading text-2xl font-bold text-primary mb-6">
                        {t('profile.stat_badges')} ({allBadges?.length || 0})
                    </h2>
                    {allBadges?.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                            {allBadges.map((badge) => (
                                <div key={badge.id} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 w-24">
                                    <BadgeIcon iconPath={badge.icon_path} alt={badge.name} size="md" />
                                    <span className="text-xs font-bold text-center text-primary leading-tight">
                                        {badge.name.replace(/\s\([^)]+\)/, '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="font-body text-gray-500 italic">{t('profile.no_badges')}</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-2xl font-bold text-primary">
                            Album Perjalanan ({statistics?.albums || 0})
                        </h2>
                        {albums?.length > 0 && (
                            <Link href={route('album.user.albums', { userId: targetUser.id })} className="text-accent font-bold text-sm hover:underline">
                                Lihat Semua
                            </Link>
                        )}
                    </div>

                    {albums?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {albums.map((album) => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    ) : (
                        <p className="font-body text-gray-500 italic">Belum ada album publik.</p>
                    )}
                </div>
            </div>
        </section>
    );
}


// =========================================================
// LAYOUT
// =========================================================
Show.layout = (page) => (
    <MainLayout
        pageTitle="title.profile_show"
        pageDescription="Lihat profil pengguna NuraLoka."
        content={page}
    />
);
