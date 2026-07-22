import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import BadgeIcon from '@components/Common/BadgeIcon';
import Button from '@components/Forms/Button';
import { useTranslation } from '@js/i18n';
import { IoChevronBackSharp } from 'react-icons/io5';

export default function Badges({ generalBadges = [], specialBadges = [] }) {
    const { t } = useTranslation();
    return (
        <>
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="pt-8 pb-16">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-heading text-title font-bold text-primary">{t('challenge.badges_page_title')}</h1>
                        <RegionalGreeting phrase="challenge_badges" className="local-language text-body mb-6" />

                        <Link href={route('challenge.index')}>
                            <Button iconLeft={<IoChevronBackSharp />}>
                                {t('challenge.back_to_challenge')}
                            </Button>
                        </Link>
                    </div>

                    {/*
                        Lencana Umum.

                        Sebelumnya berupa tabel 4 kolom di dalam overflow-x-auto:
                        di ponsel harus digeser ke samping, dan teksnya mengecil
                        sampai 8–10px agar muat. Sekarang tiap kategori jadi satu
                        kartu yang menumpuk ke bawah, sehingga lencananya bisa
                        ditampilkan jauh lebih besar.
                    */}
                    <div className="mb-10">
                        <h2 className="text-subtitle font-heading font-bold text-primary mb-4">{t('challenge.general_badges')}</h2>

                        <div className="flex flex-col gap-5">
                            {generalBadges.map((cat, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-gray-10 bg-white p-5 shadow-sm sm:p-6"
                                >
                                    {/* Kepala kartu: nama, keterangan, lingkaran progres */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="font-heading text-paragraph font-bold text-primary">
                                                {cat.name}
                                            </h3>

                                            <p className="mt-1 max-w-2xl font-body text-small leading-relaxed text-gray-70">
                                                {cat.description}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-1.5">
                                            <div className="relative flex h-20 w-20 items-center justify-center">
                                                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                                                    <circle
                                                        cx="18" cy="18" r="16" fill="none"
                                                        className="stroke-primary" strokeWidth="3"
                                                        strokeDasharray="100 100"
                                                        strokeDashoffset={100 - (cat.progress || 0)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                <div className="absolute flex flex-col items-center justify-center text-center">
                                                    <div className="font-body text-small font-bold text-primary">{cat.progress}%</div>
                                                    <div className="font-body text-micro font-bold text-gray-50">{cat.progressCount}/{cat.progressTarget}</div>
                                                </div>
                                            </div>

                                            <div className="font-body text-micro font-bold uppercase tracking-wider text-primary sm:text-center">
                                                {t('challenge.toward_tier', { tier: cat.nextTier.toLowerCase() })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tingkatan lencana — 2 kolom di ponsel, 4 mulai sm */}
                                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-10 pt-5 sm:grid-cols-4">
                                        {cat.tiers.map((tier, tIdx) => (
                                            <div key={tIdx} className="flex flex-col items-center text-center">
                                                <BadgeIcon
                                                    iconPath={tier.icon_path}
                                                    alt={tier.name}
                                                    earned={tier.earned}
                                                    size="xl"
                                                />

                                                <div className="mt-2 font-body text-small font-semibold text-gray-85">
                                                    {tier.name}
                                                </div>

                                                <div className="font-body text-micro text-gray-50">
                                                    {tier.target} {cat.name.split(' ')[2]}
                                                </div>

                                                <div className={`mt-1 font-body text-micro font-bold ${tier.earned ? 'text-secondary' : 'text-gray-40'}`}>
                                                    {t('challenge.podium_points', { points: tier.points })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lencana Khusus */}
                    <div>
                        <h2 className="text-subtitle font-heading font-bold text-primary mb-4">{t('challenge.special_badges')}</h2>

                        {/* Cards, not a table — the same reason as the general
                            badges: a 4-column table forces sideways scrolling on
                            a phone. */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {specialBadges.map((badge, idx) => (
                                <div
                                    key={idx}
                                    className="
                                        flex flex-col items-center
                                        rounded-2xl border border-gray-10
                                        bg-white p-6 text-center
                                        shadow-sm transition-all duration-300

                                        hover:-translate-y-1 hover:shadow-md
                                    "
                                >
                                    <BadgeIcon
                                        iconPath={badge.icon_path}
                                        alt={badge.name}
                                        earned={badge.earned}
                                        size="2xl"
                                    />

                                    <h3 className="mt-4 font-heading text-paragraph font-bold text-primary">
                                        {badge.name}
                                    </h3>

                                    <div className={`mt-1 font-body text-small font-bold ${badge.earned ? 'text-secondary' : 'text-gray-40'}`}>
                                        {t('challenge.podium_points', { points: badge.points })}
                                    </div>

                                    <p className="mt-3 font-body text-small leading-relaxed text-gray-70">
                                        {badge.description}
                                    </p>

                                    <p className="mt-2 font-body text-micro leading-relaxed text-gray-50">
                                        {badge.how_to}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}

Badges.layout = (page) => <MainLayout pageTitle="title.badges" content={page}></MainLayout>
