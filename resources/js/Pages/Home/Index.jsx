import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import NewsCard from '@components/Features/NewsCard';
import MainLayout from '@js/Layouts/MainLayout';
import { useTranslation } from '@js/i18n';

import { Link } from '@inertiajs/react';
import {
    FiChevronRight,
    FiMapPin,
    FiSearch,
} from 'react-icons/fi';

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
}) {
    const { t } = useTranslation()

    const newsItems =
        latestNews.length > 0
            ? latestNews
            : news;

    const heroDescParts = t('home.hero_desc').split(':app');
    const greetingParts = t('home.search_greeting').split(':name');

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
                            {auth.user.fullname}
                        </span>
                        {greetingParts[1]}
                    </h2>

                    <p className="local-language">
                        Panjenengan badhé tindak pundi dinten menika,{' '}
                        {auth.user.fullname}?
                    </p>

                    <form className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Input
                            type="search"
                            name="placeSearch"
                            icon={<FiSearch size={20} />}
                            placeholder="Temukan destinasi wisatamu sekarang..."
                        />

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
                <div className="flex flex-col items-center gap-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm sm:flex-row">
                    <img
                        src="/images/home/mission-badge.png"
                        alt="Badge misi"
                        className="h-24 w-24 shrink-0 rounded-full object-cover"
                    />

                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-paragraph font-heading text-primary-100">
                            <span className="font-bold">
                                {t('home.mission_nearest')}
                            </span>{' '}
                            Kunjungi 10 lokasi kuliner lokal di Indonesia
                        </h2>

                        <p className="text-body text-secondary-100">
                            Selesaikan misi ini untuk mendapatkan lencana perak kuliner dan poin Nura sebesar 100 poin.
                        </p>

                        <Button
                            type="button"
                            variant="primary"
                            size="btn-md"
                            className="mt-4"
                        >
                            {t('common.view_detail')}
                        </Button>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <span className="text-body text-secondary-100">
                            {t('home.progress_you')}
                        </span>

                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-primary-30 border-r-primary-100">
                            <span className="font-semibold text-primary-100">
                                40%
                            </span>
                        </div>
                    </div>
                </div>
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

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Gambar Besar Kiri */}
                    <AlbumCard
                        {...albums[0]}
                        className="min-h-[420px]"
                    />

                    {/* Bagian Kanan */}
                    <div className="grid grid-rows-2 gap-4">
                        {/* Gambar Lebar Kanan Atas */}
                        <AlbumCard
                            {...albums[1]}
                            className="min-h-[200px]"
                        />

                        {/* 2 Gambar Kecil Kanan Bawah */}
                        <div className="grid grid-cols-2 gap-4">
                            <AlbumCard
                                {...albums[2]}
                                className="min-h-[200px]"
                            />

                            <AlbumCard
                                {...albums[3]}
                                className="min-h-[200px]"
                            />
                        </div>
                    </div>
                </div>
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
                className="flex shrink-0 items-center gap-1 text-sm text-secondary-100 transition-opacity hover:opacity-70"
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
    className = '',
}) {
    const { t } = useTranslation();
    return (
        <Link
            href="#"
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

                <p className="mt-1 text-xs text-white/70">
                    {t('home.album_card_subtitle')}
                </p>
            </div>
        </Link>
    );
}

Index.layout = (page) => (
    <MainLayout
        pageTitle="Beranda"
        pageDescription="Temukan destinasi wisata, misi perjalanan, momen Nuravers, dan wawasan wisata terbaik bersama NuraLoka."
        content={page}
    />
);
