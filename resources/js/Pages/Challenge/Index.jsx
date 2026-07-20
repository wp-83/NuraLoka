import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import { useTranslation } from '@js/i18n';

// ─── Badge Icon Component ──────────────────────────────────────────────────
function BadgeIcon({ badge, size = 'md' }) {
    const sizeClass = size === 'lg' ? 'w-20 h-20' : size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    const colors = badge.earned
        ? 'bg-amber-100 border-amber-400 shadow-amber-200'
        : 'bg-gray-100 border-gray-300 shadow-gray-100';

    const initials = badge.name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('');

    return (
        <div className={`${sizeClass} rounded-full border-2 ${colors} flex items-center justify-center shadow-md transition-transform hover:scale-105 flex-shrink-0 bg-white`}>
            {badge.icon_path ? (
                <img
                    src={badge.icon_path.startsWith('http') ? badge.icon_path : `/${badge.icon_path}`}
                    alt={badge.name}
                    className={`w-[85%] h-[85%] object-contain ${badge.earned ? '' : 'grayscale opacity-45'}`}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
            ) : null}
            <span
                className={`text-sm font-bold ${badge.earned ? 'text-amber-700' : 'text-gray-400'} ${badge.icon_path ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
            >
                {initials}
            </span>
        </div>
    );
}

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
                <div className={`font-black text-sm sm:text-base ${config.pointColor}`}>
                    {t('challenge.podium_points', { points: entry.points?.toLocaleString('id-ID') })}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider text-center">
                    {entry.level}
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-800 mt-auto mb-2 text-center max-w-[8rem] leading-tight px-1 truncate w-full">
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
            <Head title={`${t('challenge.meta_title')} | NuraLoka`} />
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
                    {/* ── Page Title ── */}
                    <div className="mb-6">
                        <h1 className="font-heading text-3xl font-bold text-primary">{t('challenge.title')}</h1>
                        <p className="text-sm text-info font-medium mt-0.5 italic text-[#1B86FF]">Tetandingan Nuravers</p>
                        <div className="h-0.5 w-16 bg-[#1B86FF] mt-1" />
                    </div>

                    {/* ── TOP CARDS: Poin + Level ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {/* Total Poin Card */}
                        <div className="relative overflow-hidden bg-[#FAF0D9] border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center min-h-[7.5rem]">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-primary mb-1">{t('challenge.total_points')}</div>
                                    <div className="text-4xl font-black text-secondary tracking-wide flex items-center gap-2">
                                        {(totalPoints ?? 0).toLocaleString('id-ID')} {t('challenge.points_suffix')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level Card */}
                        <div className="relative overflow-hidden bg-[#FAF0D9] border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex flex-col justify-between h-full w-full">
                                <div className="flex justify-between items-center w-full mb-1">
                                    <span className="font-bold text-lg text-primary">{t('challenge.level_current')}</span>
                                    <Link href={route('challenge.levels')} className="text-xs text-accent hover:text-accent-85 font-bold transition-colors">
                                        {t('challenge.see_all_levels')}
                                    </Link>
                                </div>
                                {nextLevel ? (
                                    <div className="flex justify-between items-end w-full mb-2">
                                        <span className="text-xs font-bold text-gray-500">
                                            {(() => {
                                                const [a, b] = t('challenge.points_to_next', { points: pointsForNextLevel.toLocaleString('id-ID') }).split(':level');
                                                return (<>{a}<span className="font-bold">{nextLevel.name}</span>{b}</>);
                                            })()}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500">
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
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <img src="/images/badges/special/2.png" alt="icon" className="w-6 h-6 object-contain drop-shadow-sm" />
                                <h2 className="font-heading text-xl font-bold text-primary">{t('challenge.badges_title')}</h2>
                            </div>
                            <Link
                                href={route('challenge.badges')}
                                className="text-sm text-accent hover:text-accent-85 font-bold transition-colors"
                            >
                                {t('challenge.badges_link')}
                            </Link>
                        </div>

                        <div className="bg-[#FAF0D9] rounded-2xl border border-amber-200 shadow-sm p-5 relative overflow-hidden">
                            <img
                                src="/images/patterns/object.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.06]"
                            />
                            <div className="relative z-10 flex gap-5 overflow-x-auto pb-2 justify-around hide-scrollbar">
                                {previewBadges.map((badge) => (
                                    <div key={badge.id} className="flex flex-col items-center gap-1.5 min-w-[5rem] text-center">
                                        <BadgeIcon badge={badge} size="lg" />
                                        <span className={`text-xs font-bold leading-tight max-w-[6rem] ${badge.earned ? 'text-primary' : 'text-gray-400'}`}>
                                            {badge.name.replace(/\s\([^)]+\)/, '')}
                                        </span>
                                        <span className={`text-[10px] font-semibold ${badge.earned ? 'text-secondary' : 'text-gray-400'}`}>
                                            {badge.points > 0 ? t('challenge.point_amount', { points: badge.points }) : t('challenge.point_none')}
                                            {badge.name.match(/\(([^)]+)\)/)?.[1] ? ` (${badge.name.match(/\(([^)]+)\)/)[1]})` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── MISI HAMPIR SELESAI ── */}
                    <section className="mb-8">
                        <div className="bg-[#FAF8F4] border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 flex-shrink-0">
                                    <img
                                        src="/images/mascots/map.png"
                                        alt="mascot"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-bold text-primary">{t('challenge.missions_title')}</h2>
                                    <p className="text-sm text-gray-500 font-medium">{t('challenge.missions_desc')}</p>
                                </div>
                            </div>

                            {ongoingMissions && ongoingMissions.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {ongoingMissions.map((mission) => (
                                        <Link 
                                            key={mission.id} 
                                            href={route('challenge.badges')}
                                            className="bg-[#EEF5F0] rounded-xl p-4 border border-green-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:bg-[#E2ECE5] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3 mb-4 z-10 relative">
                                                <div className="w-14 h-14 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {mission.badge_icon ? (
                                                        <img
                                                            src={`/${mission.badge_icon}`}
                                                            alt={mission.badge}
                                                            className="w-full h-full object-contain drop-shadow-md"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-base text-primary leading-tight group-hover:text-secondary transition-colors">{mission.title}</div>
                                                    <div className="text-xs text-secondary font-bold mt-0.5">
                                                        {t('challenge.mission_points', { points: mission.points })}
                                                    </div>
                                                    <p className="text-xs text-gray-700 font-medium mt-1 leading-relaxed">{mission.description}</p>
                                                </div>
                                            </div>
                                            <div className="mt-auto z-10 relative">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span className="font-medium">{t('challenge.progress_you')}</span>
                                                    <span className="font-medium">{t('challenge.mission_progress', { progress: mission.progress, target: mission.target, percent: mission.percent })}</span>
                                                </div>
                                                <ProgressBar percent={mission.percent} color="bg-secondary" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-[#EEF5F0] rounded-xl border border-green-100 shadow-sm">
                                    <div className="text-3xl mb-2">🎉</div>
                                    <div className="font-bold text-primary">{t('challenge.missions_empty_title')}</div>
                                    <div className="text-sm text-gray-500 mt-1">{t('challenge.missions_empty_desc')}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── PAPAN PERINGKAT ── */}
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/images/badges/special/3.png" alt="icon" className="w-6 h-6 object-contain drop-shadow-sm" />
                            <h2 className="font-heading text-xl font-bold text-primary">{t('challenge.leaderboard_title')}</h2>
                        </div>

                        <div className="bg-[#FAF8F4] rounded-2xl shadow-sm">
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
                                                        <div className="font-bold text-sm text-primary truncate">{entry.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-medium italic mb-0.5">{entry.level}</div>
                                                        <div className="text-xs text-secondary font-bold">{t('challenge.points_nura', { points: entry.points?.toLocaleString('id-ID') })}</div>
                                                    </div>
                                                    <div className="text-xl font-black text-primary pr-2">
                                                        #{entry.rank}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end mt-4">
                                        <Link href={route('challenge.leaderboard')} className="px-5 py-3 bg-primary hover:bg-primary-85 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm text-center">
                                            {t('challenge.see_all_leaderboard')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── TUKAR POIN (Coming Soon) ── */}
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/images/badges/special/1.png" alt="icon" className="w-6 h-6 object-contain drop-shadow-sm" />
                            <h2 className="font-heading text-xl font-bold text-primary">{t('challenge.redeem_title')}</h2>
                        </div>

                        <div className="bg-[#F2F2F2] rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 mb-4">
                                <img
                                    src="/images/mascots/wait.png"
                                    alt="mascot"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-primary mb-1">{t('challenge.coming_soon')}</h3>
                            <p className="text-sm text-gray-600 font-medium">{t('challenge.coming_soon_desc')}</p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

ChallengeIndex.layout = (page) => <MainLayout pageTitle="Tantangan" content={page}></MainLayout>
