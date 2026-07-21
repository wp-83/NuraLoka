import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import BadgeIcon from '@components/Common/BadgeIcon';
import EmptyState from '@components/Common/EmptyState';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import { useTranslation } from '@js/i18n';
import { FiSearch, FiX } from 'react-icons/fi';
import { IoChevronBackSharp } from 'react-icons/io5';

export default function LeaderboardFull({ leaderboard = [], search = '', totalResults = null }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('challenge.leaderboard'), { search: searchTerm }, { preserveState: true });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('challenge.leaderboard'));
    };

    return (
        <>
            <div>
                <main className="w-full pt-8 pb-16">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-title font-bold text-primary mb-2">{t('challenge.leaderboard_page_title')}</h1>
                        <RegionalGreeting phrase="challenge_leaderboard" className="local-language mb-5" />

                        <div className="flex justify-between items-end">
                            <Link href={route('challenge.index')}>
                                <Button iconLeft={<IoChevronBackSharp />}>
                                    {t('challenge.back_to_challenge')}
                                </Button>
                            </Link>

                            {totalResults !== null && (
                                <div className="text-sm text-gray-500 italic">{t('challenge.found_users', { count: totalResults })}</div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <form onSubmit={handleSearch}>
                            <Input
                                name="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('challenge.leaderboard_search_placeholder')}
                                icon={<FiSearch size={18} />}
                                iconRight={
                                    searchTerm && (
                                        <Button
                                            unstyled
                                            onClick={clearSearch}
                                            className="text-gray-50 transition-colors hover:text-gray-85"
                                            aria-label={t('challenge.leaderboard_search_placeholder')}
                                        >
                                            <FiX size={18} />
                                        </Button>
                                    )
                                }
                            />
                        </form>
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-6">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((user) => {
                                // Background based on rank or if current user in search
                                let bgClass = "bg-[#EEF5F0]";
                                let rowBorder = "";
                                if (search && user.is_current) {
                                    bgClass = "bg-[#FFF8F3] border-[#FDBA74]";
                                    rowBorder = "border";
                                } else if (!search) {
                                    if (user.rank === 1) bgClass = "bg-gradient-to-r from-[#FDE68A] to-[#FEF3C7] border-[#FCD34D] border";
                                    else if (user.rank === 2) bgClass = "bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6] border-[#D1D5DB] border";
                                    else if (user.rank === 3) bgClass = "bg-gradient-to-r from-[#FFEDD5] to-[#FFF7ED] border-[#FDBA74] border";
                                }

                                return (
                                    <Link
                                        key={user.user_id}
                                        href={route('profile.show', { username: user.username })}
                                        className={`flex items-center p-4 rounded-xl ${bgClass} ${rowBorder} transition-colors relative overflow-hidden shadow-sm ${!rowBorder ? 'border border-black/5' : ''} cursor-pointer hover:shadow-md`}
                                    >

                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-amber-100 mr-4 border border-white/50">
                                            {user.profile_path ? (
                                                <img src={user.profile_path} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-amber-800 uppercase text-lg">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="text-paragraph text-primary font-heading">
                                                {user.name} {user.is_current ? <span className="text-secondary">{t('challenge.you')}</span> : ''}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-body">
                                                <span className="text-secondary font-bold">{user.level}</span>
                                                <span className="text-accent">•</span>
                                                <span className="text-secondary font-medium">{t('challenge.podium_points', { points: user.points.toLocaleString('id-ID') })}</span>
                                            </div>
                                        </div>

                                        {/* Badges Preview */}
                                        <div className="hidden sm:flex items-center mr-12">
                                            <div className="flex items-center gap-1.5">
                                                {user.badge_icons.map((icon, idx) => (
                                                    <BadgeIcon key={idx} iconPath={icon} alt="badge" size="sm" />
                                                ))}
                                                {user.badge_count > 5 && (
                                                    <span className="text-xs font-bold text-gray-500">
                                                        +{user.badge_count - 5}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rank */}
                                        <div className="text-subtitle font-bold font-heading text-accent min-w-[3rem] text-right">
                                            #{user.rank}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <EmptyState
                                title={search ? t('challenge.no_match') : t('challenge.no_data')}
                            />
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}

LeaderboardFull.layout = (page) => <MainLayout pageTitle="title.leaderboard" content={page}></MainLayout>
