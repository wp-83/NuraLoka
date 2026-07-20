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
export default function Show({ targetUser, totalUser, rank, totalBadge, statistics, recentBadges, allBadges, albums }) {
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
                                    <img
                                        src={`/${badge.icon_path}`}
                                        alt={badge.name}
                                        title={badge.name}
                                        className="h-14 w-14 object-contain"
                                    />
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
                                <Link key={album.id} href={route('album.show', { album: album.slug })} className="block group">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                            {album.thumbnail ? (
                                                <img src={`/storage/${album.thumbnail}`} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Tanpa Foto</div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                                {album.photo_count}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-primary truncate group-hover:text-secondary transition-colors">{album.title}</h3>
                                            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                <span className="truncate">{album.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
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
        pageTitle="Profil Pengguna"
        pageDescription="Lihat profil pengguna NuraLoka."
        content={page}
    />
);
