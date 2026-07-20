import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import NewsCard from '@components/Features/NewsCard';
import MainLayout from '@js/Layouts/MainLayout';
import { useTranslation } from '@js/i18n';

import { Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiChevronRight,
    FiMapPin,
    FiSearch,
} from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi';

const albums = [
    {
        id: 1,
        title: 'Warna-warni Pasar Tradisional Ubud, Bali',
        image: '/images/home/album-1.jpg',
        className: 'row-span-2',
    },
    {
        id: 2,
        title: 'Denyut Kehidupan Malioboro, Yogyakarta',
        image: '/images/home/album-2.jpg',
        className: 'col-span-2',
    },
    {
        id: 3,
        title: 'Pesona Air Terjun Madakaripura, Jawa Timur',
        image: '/images/home/album-3.jpg',
        className: '',
    },
    {
        id: 4,
        title: 'Keajaiban Kaldera dari Gunung Bromo',
        image: '/images/home/album-4.jpg',
        className: '',
    },
];

const news = [
    {
        id: 1,
        title: 'Mengenal Filosofi Batik di Balik Setiap Motifnya',
        date: '3 jam yang lalu',
        image: '/images/home/news-1.jpg',
        description:
            'Batik tidak hanya dikenal sebagai warisan budaya Indonesia, tetapi juga sebagai media yang menyimpan berbagai makna dan cerita. Setiap motif batik memiliki...',
    },
    {
        id: 2,
        title: 'Menjelajahi Destinasi dengan Bertanggung Jawab',
        date: '6 jam yang lalu',
        image: '/images/home/news-2.jpg',
        description:
            'Menjadi wisatawan yang baik tidak hanya tentang menikmati keindahan suatu tempat, tetapi juga menjaga kelestariannya. Mulai dari mengurangi sampah, menghormati...',
    },
    {
        id: 3,
        title: 'Pesona Kuliner Lokal',
        date: '12 jam yang lalu',
        image: '/images/home/news-3.jpg',
        description:
            'Menjelajahi sebuah daerah tidak akan lengkap tanpa mencicipi kuliner khasnya. Setiap hidangan memiliki cerita yang berkaitan dengan sejarah, budaya, dan kehidupan...',
    },
];

export default function Index({
    auth,
    latestNews = [],
    ongoingMission = null,
    popularAlbums = [],
}) {
    const { t } = useTranslation()

    const newsItems =
        latestNews.length > 0
            ? latestNews
            : news;

    const heroDescParts = t('home.hero_desc').split(':app');
    const greetingParts = t('home.search_greeting').split(':name');

    // ── Search "Satu Titik" — sama persis dengan logika di halaman Jelajah ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const skipSearchRef = useRef(false);

    // Debounced fetch saran dari /jelajah/cari (300ms)
    useEffect(() => {
        if (skipSearchRef.current) {
            skipSearchRef.current = false;
            setSearchSuggestions([]);
            return;
        }
        const q = searchQuery.trim();
        if (q === '') { setSearchSuggestions([]); return; }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/jelajah/cari?q=${encodeURIComponent(q)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                setSearchSuggestions(data.suggestions || []);
            } catch (err) {
                if (!controller.signal.aborted) console.error('[HomeSearch] gagal memuat saran:', err.message);
            }
        }, 300);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [searchQuery]);

    // Klik saran → navigasi ke halaman Jelajah dengan koordinat tempat
    const handleSuggestionSelect = useCallback((place) => {
        skipSearchRef.current = true;
        setSearchQuery(place.name);
        setSearchSuggestions([]);

        // Kirim data tempat lewat URL params agar Jelajah bisa langsung zoom + popup
        const url = new URL(route('explore.index'), window.location.origin);
        url.searchParams.set('focus_id', place.id);
        url.searchParams.set('focus_lat', place.latitude);
        url.searchParams.set('focus_lng', place.longitude);
        url.searchParams.set('focus_name', place.name);
        if (place.slug) url.searchParams.set('focus_slug', place.slug);
        if (place.address) url.searchParams.set('focus_address', place.address);
        router.visit(url.toString());
    }, []);

    // Submit form → jika ada saran, ambil yang teratas; jika tidak, pindah ke Jelajah biasa
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchSuggestions.length > 0) {
            handleSuggestionSelect(searchSuggestions[0]);
        } else {
            router.visit(route('explore.index'));
        }
    };

    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="relative">
                {/* Background full viewport */}
                <div className="relative left-1/2 min-h-[64vh] sm:min-h-[68vh] w-[99vw] -translate-x-1/2 overflow-hidden">
                    <img
                        src="/images/backgrounds/home.jpg"
                        alt="Keindahan wisata Indonesia"
                        className="absolute inset-0 h-full w-full opacity-100 object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Konten tetap mengikuti container dari MainLayout */}
                <div className="absolute container inset-0 z-10 flex min-h-[540px] flex-col justify-between py-12 sm:py-16">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-hero font-heading font-bold">
                            {t('home.hero_title')}
                        </h1>

                        <p className="mt-2 text-paragraph local-language !text-info-light">
                            Mantêpaken lampah panjenengan
                        </p>

                        <div className="mt-20 max-w-2xl font-heading">
                            <p className="leading-relaxed text-paragraph">
                                {heroDescParts[0]}
                                <span className="rounded bg-white px-1 font-bold text-secondary-100">
                                    <span className="nuraloka-text">
                                        <span className="nura">Nura</span>
                                        <span className="loka">Loka</span>
                                    </span>
                                </span>
                                {heroDescParts[1]}
                            </p>

                            <p className="mt-2 text-small local-language !text-info-light max-w-xl">
                                Saking ikon wisata ingkang misuwur dumugi papan
                                wisata istimewa ingkang kasimpen, temokake
                                destinasi ingkang cocog kaliyan gaya lelampahan
                                panjenengan sesarengan kaliyan NuraLoka.
                            </p>
                        </div>
                    </div>

                    <img
                        src="/images/mascot/mascot-search.png"
                        alt="Maskot NuraLoka"
                        className="absolute right-4 bottom-0 hidden w-40 lg:block xl:w-52"
                    />
                </div>
            </section>

            {/* Search */}
            <section className="container relative z-20 -mt-16">
                <div className="rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:p-6">
                    <h2 className="text-lg font-heading text-paragraph text-primary-100">
                        {greetingParts[0]}
                        <span className="font-bold">
                            {auth?.user?.fullname || 'Pengunjung'}
                        </span>
                        {greetingParts[1]}
                    </h2>

                    <p className="local-language">
                        Panjenengan badhé tindak pundi dinten menika,{' '}
                        {auth?.user?.fullname || 'Pengunjung'}?
                    </p>

                    <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
                        <div className="relative flex-1">
                            <Input
                                type="search"
                                name="placeSearch"
                                icon={<FiSearch size={20} />}
                                placeholder="Temukan destinasi wisatamu sekarang..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* Dropdown Saran */}
                            {searchSuggestions.length > 0 && searchQuery.trim() !== '' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[500] overflow-y-auto max-h-56">
                                    {searchSuggestions.map((place) => (
                                        <div
                                            key={place.id}
                                            onClick={() => handleSuggestionSelect(place)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary-100/10 cursor-pointer transition-colors"
                                        >
                                            <FiMapPin className="text-gray-400 flex-shrink-0" size={14} />
                                            <div className="min-w-0 flex-grow">
                                                <p className="text-sm font-bold text-primary-100 truncate">{place.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{place.address || 'Tidak ada alamat'}</p>
                                            </div>
                                            {place.categories?.[0]?.name && (
                                                <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold bg-secondary-100/10 text-secondary-100">
                                                    {place.categories[0].name}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="btn-md"
                        >
                            {t('home.search_button')}
                        </Button>
                    </form>
                </div>
            </section>

            {/* Mission */}
            <section className="container mt-10">
                {ongoingMission ? (
                    <div className="flex flex-col items-center gap-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm sm:flex-row">
                        {ongoingMission.badge_icon ? (
                            <img
                                src={`/${ongoingMission.badge_icon}`}
                                alt={ongoingMission.badge}
                                className="h-24 w-24 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <img
                                src="/images/home/mission-badge.png"
                                alt="Badge misi"
                                className="h-24 w-24 shrink-0 rounded-full object-cover"
                            />
                        )}

                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-paragraph font-heading text-primary-100">
                                <span className="font-bold">
                                    {t('home.mission_nearest')}
                                </span>{' '}
                                {ongoingMission.title}
                            </h2>

                            <p className="text-body text-secondary-100">
                                {ongoingMission.description}
                            </p>

                            <Link href={route('challenge.badges')} className="inline-block mt-4">
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="btn-md"
                                >
                                    {t('common.view_detail')}
                                </Button>
                            </Link>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-2">
                            <span className="text-body text-secondary-100">
                                {t('home.progress_you')}
                            </span>

                            <div
                                className="flex h-20 w-20 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(var(--color-primary-100, #1e3a5f) ${ongoingMission.percent * 3.6}deg, var(--color-primary-30, #dbeafe) ${ongoingMission.percent * 3.6}deg)`,
                                }}
                            >
                                <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-blue-50">
                                    <span className="font-semibold text-primary-100">
                                        {ongoingMission.percent}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-5 rounded-2xl border border-blue-100 bg-blue-50 p-8 shadow-sm text-center">
                        <img
                            src="/images/home/mission-badge.png"
                            alt="Badge misi"
                            className="h-24 w-24 shrink-0 rounded-full object-cover opacity-50"
                        />
                        <div>
                            <p className="font-heading font-bold text-paragraph text-primary-100">
                                {t('challenge.missions_empty_title')}
                            </p>
                            <p className="mt-1 text-body text-secondary-100">
                                {t('challenge.missions_empty_desc')}
                            </p>
                        </div>
                        <Link href={route('challenge.index')} className="inline-block">
                            <Button variant="primary" size="btn-md">
                                {t('common.view_detail')}
                            </Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* Album */}
            <section className="container pt-16 pb-24">
                <SectionHeader
                    mascot="/images/mascots/camera.png"
                    title={t('home.album_title')}
                    description={t('home.album_desc')}
                    linkLabel={t('home.album_link')}
                    href={route(
                        'album.index',
                    )}
                />

                {popularAlbums.length === 1 ? (
                    <div className="mt-6">
                        <AlbumCard
                            title={popularAlbums[0].title}
                            image={popularAlbums[0].thumbnail ? `/storage/${popularAlbums[0].thumbnail}` : '/images/defaults/image.png'}
                            slug={popularAlbums[0].slug}
                            view_count={popularAlbums[0].view_count}
                            className="min-h-[420px]"
                        />
                    </div>
                ) : popularAlbums.length === 2 ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AlbumCard
                            title={popularAlbums[0].title}
                            image={popularAlbums[0].thumbnail ? `/storage/${popularAlbums[0].thumbnail}` : '/images/defaults/image.png'}
                            slug={popularAlbums[0].slug}
                            view_count={popularAlbums[0].view_count}
                            className="min-h-[420px]"
                        />
                        <AlbumCard
                            title={popularAlbums[1].title}
                            image={popularAlbums[1].thumbnail ? `/storage/${popularAlbums[1].thumbnail}` : '/images/defaults/image.png'}
                            slug={popularAlbums[1].slug}
                            view_count={popularAlbums[1].view_count}
                            className="min-h-[420px]"
                        />
                    </div>
                ) : popularAlbums.length > 2 ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Gambar Besar Kiri */}
                        {popularAlbums[0] && (
                            <AlbumCard
                                title={popularAlbums[0].title}
                                image={popularAlbums[0].thumbnail ? `/storage/${popularAlbums[0].thumbnail}` : '/images/defaults/image.png'}
                                slug={popularAlbums[0].slug}
                                view_count={popularAlbums[0].view_count}
                                className="min-h-[420px]"
                            />
                        )}

                        {/* Bagian Kanan */}
                        <div className="grid grid-rows-2 gap-4">
                            {/* Gambar Lebar Kanan Atas */}
                            {popularAlbums[1] && (
                                <AlbumCard
                                    title={popularAlbums[1].title}
                                    image={popularAlbums[1].thumbnail ? `/storage/${popularAlbums[1].thumbnail}` : '/images/defaults/image.png'}
                                    slug={popularAlbums[1].slug}
                                    view_count={popularAlbums[1].view_count}
                                    className="min-h-[200px]"
                                />
                            )}

                            {/* Gambar Kanan Bawah */}
                            {popularAlbums.length === 3 ? (
                                <AlbumCard
                                    title={popularAlbums[2].title}
                                    image={popularAlbums[2].thumbnail ? `/storage/${popularAlbums[2].thumbnail}` : '/images/defaults/image.png'}
                                    slug={popularAlbums[2].slug}
                                    view_count={popularAlbums[2].view_count}
                                    className="min-h-[200px]"
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {popularAlbums[2] && (
                                        <AlbumCard
                                            title={popularAlbums[2].title}
                                            image={popularAlbums[2].thumbnail ? `/storage/${popularAlbums[2].thumbnail}` : '/images/defaults/image.png'}
                                            slug={popularAlbums[2].slug}
                                            view_count={popularAlbums[2].view_count}
                                            className="min-h-[200px]"
                                        />
                                    )}

                                    {popularAlbums[3] && (
                                        <AlbumCard
                                            title={popularAlbums[3].title}
                                            image={popularAlbums[3].thumbnail ? `/storage/${popularAlbums[3].thumbnail}` : '/images/defaults/image.png'}
                                            slug={popularAlbums[3].slug}
                                            view_count={popularAlbums[3].view_count}
                                            className="min-h-[200px]"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl border border-gray-10 bg-white">
                        <EmptyState title={t('album.my_empty')} description={t('album.start_cta')} />
                    </div>
                )}
            </section>

            {/* News */}
            <section className="container pb-20">
                <SectionHeader
                    mascot="/images/mascots/hi.png"
                    title={t('home.news_title')}
                    description={t('home.news_desc')}
                    linkLabel={t('home.news_link')}
                    href={route(
                        'news.index',
                    )}
                />

                <div className="mt-4 flex flex-col gap-5">
                    {latestNews.length >
                    0 ? (
                        latestNews.map(
                            (news) => (
                                <NewsCard
                                    key={
                                        news.id
                                    }
                                    news={
                                        news
                                    }
                                />
                            ),
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <img
                                src="/images/mascots/wait.png"
                                alt="Tidak ada wawasan wisata"
                                className="w-28"
                            />

                            <p className="mt-3 font-heading text-paragraph text-gray-100">
                                {t('home.news_empty_title')}
                            </p>

                            <p className="mt-1 font-body text-body text-gray-50">
                                {t('home.news_empty_desc')}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function SectionHeader({
    mascot,
    title,
    description,
    linkLabel,
    href,
}) {
    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
                <img
                    src={mascot}
                    alt=""
                    className="hidden h-32 w-32 shrink-0 object-contain sm:block"
                />

                <div>
                    <h2 className="text-title font-bold font-heading text-primary-100">
                        {title}
                    </h2>

                    <p className="mt-1 max-w-2xl text-body leading-relaxed text-gray-100">
                        {description}
                    </p>
                </div>
            </div>

            <Link
                href={href}
                className="flex shrink-0 items-center gap-1 text-body"
            >
                {linkLabel}

                <FiChevronRight />
            </Link>
        </div>
    );
}

function AlbumCard({
    title,
    image,
    slug,
    view_count = 0,
    className = '',
}) {
    const { t } = useTranslation();
    return (
        <Link
            href={slug ? route('album.show', slug) : '#'}
            className={`group relative min-h-[180px] overflow-hidden rounded-2xl ${className}`}
        >
            <img
                src={image}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
                <h3 className="font-semibold">
                    {title}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                    <HiOutlineEye size={14} className="shrink-0" />
                    <span>
                        {t('album.views_count', { count: Number(view_count).toLocaleString('id-ID') })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({
    title,
    description,
}) {
    return (
        <div
            className="
                flex flex-col
                items-center justify-center
                py-12 text-center
            "
        >
            <img
                src="/images/mascots/wait.png"
                alt="Maskot NuraLoka"
                className="
                    mb-4 h-24 w-24
                    object-contain
                    opacity-50
                "
            />

            <p
                className="
                    font-body text-small
                    font-medium text-gray-50
                "
            >
                {title}
            </p>

            {description && (
                <p
                    className="
                        mt-1 font-body
                        text-micro text-gray-30
                    "
                >
                    {description}
                </p>
            )}
        </div>
    );
}

Index.layout = (page) => (
    <MainLayout
        pageTitle="Beranda"
        pageDescription="Temukan destinasi wisata, misi perjalanan, momen Nuravers, dan wawasan wisata terbaik bersama NuraLoka."
        content={page}
    />
);
