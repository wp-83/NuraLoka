import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import BadgeIcon from '@components/Common/BadgeIcon';
import EmptyState from '@components/Common/EmptyState';
import Button from '@components/Forms/Button';
import { useTranslation } from '@js/i18n';
import { SlBadge } from 'react-icons/sl';
import { PiRanking } from 'react-icons/pi';
import { FaCoins } from 'react-icons/fa';

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ percent, color = 'bg-green-500' }) {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
            />
        </div>
    );
}

// ─── User Avatar Component ───────────────────────────────────────────────────
function UserAvatar({ path, name, className = "w-12 h-12" }) {
    const [failed, setFailed] = useState(false);
    const initials = name
        ? name.split(' ').slice(0, 2).map(w => w[0]).join('')
        : '?';

    // Detect if path is already a full URL (from public_profile_photo) or relative
    const imgSrc = path && (path.startsWith('http') || path.startsWith('/')) ? path : (path ? `/storage/${path}` : null);

    return (
        <div className={`${className} rounded-full overflow-hidden bg-amber-100 flex-shrink-0 flex items-center justify-center border border-gray-200`}>
            {imgSrc && !failed ? (
                <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span className="font-bold text-amber-850 uppercase text-xs sm:text-sm">{initials}</span>
            )}
        </div>
    );
}

// ─── Podium Column Component ──────────────────────────────────────────────────
function PodiumColumn({ entry, t }) {
    if (!entry) return <div className="flex-1" />;

    const rank = entry.rank;
    const config = {
        1: {
            bg: 'bg-[#FEF08A]', // Taller gold
            height: 'h-64 sm:h-72',
            avatarClass: 'w-20 h-20 sm:w-24 sm:h-24',
            containerClass: 'mt-0',
            pointColor: 'text-[#1B5E20]',
        },
        2: {
            bg: 'bg-[#FEF9C3]', // Lighter tan/gold
            height: 'h-52 sm:h-60',
            avatarClass: 'w-16 h-16 sm:w-20 sm:h-20',
            containerClass: 'mt-8',
            pointColor: 'text-[#1B5E20]',
        },
        3: {
            bg: 'bg-[#FFEDD5]', // Light peach/tan
            height: 'h-44 sm:h-52',
            avatarClass: 'w-16 h-16 sm:w-20 sm:h-20',
            containerClass: 'mt-16',
            pointColor: 'text-[#1B5E20]',
        }
    }[rank];

    return (
        <Link
            href={route('profile.show', { username: entry.username })}
            className={`flex flex-col items-center flex-1 relative ${config.containerClass} cursor-pointer group`}
        >
            <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 z-10">
                <UserAvatar path={entry.profile_path} name={entry.name} className={`${config.avatarClass} shadow-md group-hover:ring-2 ring-secondary transition-all`} />
            </div>

            <div className={`w-full ${config.bg} ${config.height} rounded-t-3xl pt-14 sm:pt-16 pb-4 px-2 flex flex-col items-center justify-start shadow-sm border border-black/5 group-hover:shadow-md transition-shadow`}>
                <div className={`font-heading text-paragraph font-bold ${config.pointColor}`}>
                    {t('challenge.podium_points', { points: entry.points?.toLocaleString('id-ID') })}
                </div>
                <div className="text-body font-bold text-accent mt-1 uppercase tracking-wider text-center">
                    {entry.level}
                </div>
                <div className="text-paragraph font-bold text-primary mt-auto mb-2 text-center max-w-[8rem] leading-tight px-1 truncate w-full">
                    {entry.name}
                </div>
            </div>
        </Link>
    );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function ChallengeIndex({
    user = {},
    totalPoints = 0,
    currentLevel = {},
    nextLevel = null,
    pointsForNextLevel = 0,
    progressPercent = 0,
    allBadges = [],
    ongoingMissions = [],
    leaderboard = [],
}) {
    const { t } = useTranslation();
    const top3 = (leaderboard ?? []).slice(0, 3);
    const rest = (leaderboard ?? []).slice(3);

    // Show 5 specific badges for the homepage preview based on the design
    // Find highest tier for category or just use specific badges
    let previewBadges = allBadges?.filter(b => [
        'Sahabat Nuka',
        'Si Paling Kuliner (Perunggu)',
        'Si Paling Kuliner (Perak)',
        'Si Paling Kuliner (Emas)',
        'Si Paling Kuliner (Berlian)'
    ].includes(b.name))
    .sort((a, b) => {
        const order = ['Sahabat Nuka', 'Si Paling Kuliner (Perunggu)', 'Si Paling Kuliner (Perak)', 'Si Paling Kuliner (Emas)', 'Si Paling Kuliner (Berlian)'];
        return order.indexOf(a.name) - order.indexOf(b.name);
    }).slice(0, 5) || [];

    // Fallback: If admin deleted these default badges, show other available badges
    if (previewBadges.length < 5 && allBadges) {
        const others = allBadges.filter(b => !previewBadges.find(pb => pb.id === b.id)).slice(0, 5 - previewBadges.length);
        previewBadges = [...previewBadges, ...others];
    }

    return (
        <>
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="w-full py-8">
                    {/* ── Page Title ── */}
                    <div className="mb-10">
                        <h1 className="font-heading text-hero font-bold text-primary mb-2">{t('challenge.title')}</h1>
                        <RegionalGreeting phrase="challenge_index" className="locale-language text-paragraph mt-1" />
                    </div>

                    {/* ── TOP CARDS: Poin + Level ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                        {/* Total Poin Card */}
                        <div className="relative overflow-hidden bg-primary-10 rounded-2xl p-5 shadow-md flex flex-col justify-center min-h-[7.5rem]">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="text-subtitle font-heading font-bold text-primary mb-4">{t('challenge.total_points')}</div>
                                    <div className="text-title font-black text-secondary tracking-wide flex items-center gap-2">
                                        {(totalPoints ?? 0).toLocaleString('id-ID')} {t('challenge.points_suffix')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level Card */}
                        <div className="relative overflow-hidden bg-primary-10 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex flex-col justify-between h-full w-full">
                                <div className="flex justify-between items-center w-full mb-4">
                                    <span className="font-bold text-subtitle font-heading text-primary">{t('challenge.level_current')}</span>
                                    <Link href={route('challenge.levels')}>
                                        {t('challenge.see_all_levels')}
                                    </Link>
                                </div>
                                {nextLevel ? (
                                    <div className="flex justify-between items-end w-full mb-1">
                                        <span className="text-small font-bold text-gray-70">
                                            {(() => {
                                                const [a, b] = t('challenge.points_to_next', { points: pointsForNextLevel.toLocaleString('id-ID') }).split(':level');
                                                return (<>{a}<span className="font-bold">{nextLevel.name}</span>{b}</>);
                                            })()}
                                        </span>
                                        <span className="text-small font-bold text-gray-70">
                                            {t('challenge.points_progress', { current: totalPoints.toLocaleString('id-ID'), max: nextLevel.min.toLocaleString('id-ID') })}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-secondary mb-2">{t('challenge.max_level')}</div>
                                )}
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-1">
                                        <ProgressBar percent={progressPercent} color="bg-secondary" />
                                    </div>
                                    <span className="text-lg font-black text-secondary uppercase tracking-wide whitespace-nowrap">
                                        {currentLevel?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── DAFTAR LENCANA ── */}
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <SlBadge size={32} className='text-secondary' />
                                <h2 className="font-heading text-subtitle font-bold text-primary">{t('challenge.badges_title')}</h2>
                            </div>
                            <Link href={route('challenge.badges')}>
                                {t('challenge.badges_link')}
                            </Link>
                        </div>

                        <div className="bg-primary-10 rounded-2xl shadow-md p-5 relative overflow-hidden">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex gap-5 overflow-x-auto pb-2 justify-around hide-scrollbar">
                                {previewBadges.map((badge) => (
                                    <div key={badge.id} className="flex flex-col items-center gap-1.5 min-w-[5rem] text-center">
                                        <BadgeIcon iconPath={badge.icon_path} alt={badge.name} earned={badge.earned} size="lg" />
                                        <span className={`text-paragraph font-bold leading-tight ${badge.earned ? 'text-primary' : 'text-gray-400'}`}>
                                            {badge.name.replace(/\s\([^)]+\)/, '')}
                                        </span>
                                        <span className={`text-small font-semibold ${badge.earned ? 'text-secondary' : 'text-gray-400'}`}>
                                            {badge.points > 0 ? t('challenge.point_amount', { points: badge.points }) : t('challenge.point_none')}
                                            {badge.name.match(/\(([^)]+)\)/)?.[1] ? ` (${badge.name.match(/\(([^)]+)\)/)[1]})` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── MISI HAMPIR SELESAI ── */}
                    <section className="mb-16">
                        <div className="bg-[#FAF8F4] border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-32 flex-shrink-0">
                                    <img
                                        src="/images/mascots/map.png"
                                        alt="mascot"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-heading text-subtitle font-bold text-primary">{t('challenge.missions_title')}</h2>
                                    <p className="text-paragraph text-secondary">{t('challenge.missions_desc')}</p>
                                </div>
                            </div>

                            {ongoingMissions && ongoingMissions.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {ongoingMissions.map((mission) => (
                                        <Link
                                            key={mission.id}
                                            href={route('challenge.badges')}
                                            className="bg-secondary-10/50 rounded-xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:bg-secondary-10 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start gap-4 mb-4 z-10 relative">
                                                <div className="w-24 h-24 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {mission.badge_icon ? (
                                                        <img
                                                            src={`/${mission.badge_icon}`}
                                                            alt={mission.badge}
                                                            className="w-full h-full object-contain drop-shadow-md"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-paragraph text-primary leading-tight group-hover:text-secondary transition-colors">{mission.title}</div>
                                                    <div className="text-paragraph text-secondary font-bold mt-0.5">
                                                        {t('challenge.mission_points', { points: mission.points })}
                                                    </div>
                                                    <p className="text-body text-gray-700 font-medium mt-1 leading-relaxed">{mission.description}</p>
                                                </div>
                                            </div>
                                            <div className="mt-auto z-10 relative">
                                                <div className="flex justify-between text-small text-gray-500 mb-1">
                                                    <span className="font-medium">{t('challenge.progress_you')}</span>
                                                    <span className="font-medium">{t('challenge.mission_progress', { progress: mission.progress, target: mission.target, percent: mission.percent })}</span>
                                                </div>
                                                <ProgressBar percent={mission.percent} color="bg-secondary" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title={t('challenge.missions_empty_title')}
                                    description={t('challenge.missions_empty_desc')}
                                />
                            )}
                        </div>
                    </section>

                    {/* ── PAPAN PERINGKAT ── */}
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-4">
                            <PiRanking size={48} className='text-secondary' />
                            <h2 className="font-heading text-subtitle font-bold text-primary">{t('challenge.leaderboard_title')}</h2>
                        </div>

                        <div className="rounded-2xl">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                                {/* Left Side: Podium (cols 1-7) */}
                                <div className="lg:col-span-7 flex flex-col justify-end">
                                    <div className="flex items-end justify-center gap-2 sm:gap-4 pt-10 pb-4 h-full">
                                        <PodiumColumn entry={top3.find(e => e.rank === 2)} t={t} />
                                        <PodiumColumn entry={top3.find(e => e.rank === 1)} t={t} />
                                        <PodiumColumn entry={top3.find(e => e.rank === 3)} t={t} />
                                    </div>
                                </div>

                                {/* Right Side: List 4-6 (cols 8-12) */}
                                <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
                                    {rest.length > 0 && (
                                        <div className="space-y-3">
                                            {rest.map((entry) => (
                                                <Link
                                                    key={entry.username ?? entry.rank}
                                                    href={route('profile.show', { username: entry.username })}
                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-[#EEF5F0] border border-green-100 hover:bg-[#E2ECE5] hover:shadow-md transition-all cursor-pointer"
                                                >
                                                    <UserAvatar path={entry.profile_path} name={entry.name} className="w-12 h-12" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-paragraph font-heading text-primary truncate">{entry.name}</div>
                                                        <div className="text-body text-secondary italic mb-3">{entry.level}</div>
                                                        <div className="text-small text-secondary font-bold">{t('challenge.points_nura', { points: entry.points?.toLocaleString('id-ID') })}</div>
                                                    </div>
                                                    <div className="text-subtitle font-heading font-bold text-accent pr-2">
                                                        #{entry.rank}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end mt-4">
                                        <Link href={route('challenge.leaderboard')}>
                                            <Button>
                                                {t('challenge.see_all_leaderboard')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── TUKAR POIN (Coming Soon) ── */}
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FaCoins size={32} className='text-secondary' />
                            <h2 className="font-heading text-subtitle font-bold text-primary">{t('challenge.redeem_title')}</h2>
                        </div>

                        <div className="bg-gray-10 rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-32 mb-2">
                                <img
                                    src="/images/mascots/wait.png"
                                    alt="mascot"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="font-heading text-subtitle font-bold text-primary mb-1">{t('challenge.coming_soon')}</h3>
                            <p className="text-body font-heading text-gray-70">{t('challenge.coming_soon_desc')}</p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

ChallengeIndex.layout = (page) => <MainLayout pageTitle="title.challenge" content={page}></MainLayout>
