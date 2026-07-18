import { useState } from 'react';
import { Link, router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import PlaceMiniMap from '@components/Features/PlaceMiniMap';
import { useFlash } from '@js/Contexts/FlashContext';
import { useTranslation } from '@js/i18n';

import {
    FiBookmark,
    FiChevronLeft,
    FiMapPin,
    FiUsers,
} from 'react-icons/fi';

import {
    FaBookmark,
    FaMoneyBillWave,
} from 'react-icons/fa';

import { MdOutlinePark } from 'react-icons/md';

// Ambil nilai cookie (untuk header CSRF pada fetch non-Inertia)
function getCookie(name) {
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
}

export default function Show({
    place,
    gallery = [],
    isSaved: initialSaved = false,
    totalSaves = 0,
}) {
    const { t } = useTranslation();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [checkingIn, setCheckingIn] = useState(false);
    const showFlash = useFlash();

    // Salurkan hasil check-in ke Flash terpusat milik layout (sama seperti flash admin).
    const flashCheckin = (ok, message) =>
        showFlash(ok ? 'success' : 'error', message);

    // Tinggi kartu bergilir agar tata letak masonry tetap bervariasi.
    const galleryHeights = ['h-[28rem]', 'h-64', 'h-80', 'h-[32rem]', 'h-96', 'h-64', 'h-80', 'h-64'];
    const coverImage = gallery[0]?.url || '/images/placeholders/default.jpg';

    const handleToggleSave = () => {
        if (!place?.id) return;

        router.post(
            route('wishlist.toggle'),
            {
                place_id: place.id,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setIsSaved((previous) => !previous);
                },
            }
        );
    };

    const handleCheckIn = () => {
        if (!place?.id) return;
        if (!navigator.geolocation) {
            flashCheckin(false, t('explore.checkin_no_geo'));
            return;
        }
        setCheckingIn(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const res = await fetch('/jelajah/checkin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            place_id: place.id,
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        }),
                    });
                    const data = await res.json();
                    flashCheckin(res.ok && data.ok, data.message || t('explore.checkin_failed'));
                } catch (e) {
                    flashCheckin(false, t('explore.checkin_conn_error'));
                } finally {
                    setCheckingIn(false);
                }
            },
            () => {
                setCheckingIn(false);
                flashCheckin(false, t('explore.checkin_denied'));
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const formattedTotalSaves =
        Number(totalSaves).toLocaleString('id-ID');

    return (
        <>
            {/* ========================================================
                HERO SECTION
            ======================================================== */}
            <section className="relative w-full overflow-hidden">
                {/* Background Image */}
                <div
                    className="
                        absolute inset-0 z-0
                        bg-cover bg-center
                    "
                    style={{
                        backgroundImage: `url(${coverImage})`,
                    }}
                />

                {/* Background Overlay */}
                <div className="absolute inset-0 z-0" />

                <div
                    className="
                        absolute inset-0 z-0
                    "
                />

                {/* Hero Content */}
                <div className="relative z-10 pb-16 pt-8">
                    {/* Top Actions */}
                    <div
                        className="
                            mb-8 flex
                            items-center justify-between
                            gap-4
                        "
                    >
                        {/* Back */}
                        <Link
                            href={route('explore.index')}
                            className="
                                inline-flex items-center gap-2
                                rounded-xl
                                bg-primary
                                px-5 py-2.5
                                font-body text-small
                                font-semibold text-white
                                shadow-md
                                transition-all duration-200

                                hover:bg-primary-85
                                active:scale-[0.98]
                            "
                        >
                            <FiChevronLeft
                                size={18}
                                className="shrink-0"
                            />

                            <span className="hidden xs:inline">
                                {t('explore.back_to_explore')}
                            </span>
                        </Link>

                        {/* Wishlist Toggle */}
                        <button
                            type="button"
                            onClick={handleToggleSave}
                            className={`
                                inline-flex items-center gap-2
                                rounded-xl border
                                px-4 py-2
                                font-body text-small
                                font-semibold
                                shadow-sm backdrop-blur-sm
                                transition-all duration-200

                                ${
                                    isSaved
                                        ? `
                                            border-warning/30
                                            bg-warning-light/80
                                            text-warning-dark
                                            hover:bg-warning-light
                                        `
                                        : `
                                            border-secondary-30
                                            bg-white/70
                                            text-secondary
                                            hover:bg-secondary-10
                                        `
                                }
                            `}
                        >
                            <span className="hidden sm:inline">
                                {isSaved
                                    ? t('explore.saved_in_wishlist')
                                    : t('explore.save_to_wishlist')}
                            </span>

                            {isSaved ? (
                                <FaBookmark
                                    size={18}
                                    className="shrink-0"
                                />
                            ) : (
                                <FiBookmark
                                    size={18}
                                    className="shrink-0"
                                />
                            )}
                        </button>

                        {/* Check-in (verifikasi lokasi) */}
                        <button
                            type="button"
                            onClick={handleCheckIn}
                            disabled={checkingIn}
                            className="
                                inline-flex items-center gap-2
                                rounded-xl border border-accent-30
                                bg-white/70 px-4 py-2
                                font-body text-small font-semibold text-accent
                                shadow-sm backdrop-blur-sm
                                transition-all duration-200
                                hover:bg-accent-10
                                disabled:opacity-60
                            "
                        >
                            <FiMapPin size={18} className="shrink-0" />
                            <span className="hidden sm:inline">
                                {checkingIn ? t('explore.checkin_detecting') : t('explore.checkin')}
                            </span>
                        </button>
                    </div>


                    {/* Main Content */}
                    <div
                        className="
                            flex flex-col
                            items-start justify-between
                            gap-10

                            lg:flex-row
                        "
                    >
                        {/* ====================================================
                            LEFT INFORMATION
                        ==================================================== */}
                        <div className="w-full lg:w-2/3">
                            {/* Place Name */}
                            <h1
                                className="
                                    mb-4
                                    font-heading text-title
                                    font-extrabold
                                    text-primary-100
                                    drop-shadow-sm

                                    md:text-hero
                                "
                            >
                                {place?.name}
                            </h1>

                            {/* Description */}
                            <p
                                className="
                                    mb-6 max-w-3xl
                                    font-body text-paragraph
                                    font-medium leading-relaxed
                                    text-secondary-100
                                "
                            >
                                {place?.description ||
                                    t('explore.description_unavailable')}
                            </p>

                            {/* Categories */}
                            <div className="mb-8 flex flex-wrap gap-3">
                                {place?.categories?.length > 0 ? (
                                    place.categories.map(
                                        (category) => (
                                            <div
                                                key={category.id}
                                                className="
                                                    inline-flex
                                                    items-center gap-1.5
                                                    rounded-lg
                                                    bg-secondary
                                                    px-4 py-1.5
                                                    font-body text-small
                                                    font-semibold
                                                    text-white
                                                    shadow-sm
                                                "
                                            >
                                                <MdOutlinePark
                                                    size={16}
                                                    className="shrink-0"
                                                />

                                                {category.name}
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div
                                        className="
                                            inline-flex
                                            items-center gap-1.5
                                            rounded-lg
                                            bg-secondary
                                            px-4 py-1.5
                                            font-body text-small
                                            font-semibold
                                            text-white
                                            shadow-sm
                                        "
                                    >
                                        <MdOutlinePark
                                            size={16}
                                            className="shrink-0"
                                        />

                                        {t('explore.category_general')}
                                    </div>
                                )}
                            </div>

                            {/* Information */}
                            <div className="flex flex-col gap-4">
                                {/* Address */}
                                <div className="flex items-start gap-3">
                                    <FiMapPin
                                        size={22}
                                        className="
                                            mt-0.5 shrink-0
                                            text-secondary
                                        "
                                    />

                                    <span
                                        className="
                                            max-w-md
                                            font-body text-small
                                            font-medium
                                            text-gray-85

                                            md:text-body
                                        "
                                    >
                                        {place?.address ||
                                            t('explore.address_hero_fallback')}
                                    </span>
                                </div>

                                {/* Total Saves */}
                                <div className="flex items-center gap-3">
                                    <FiUsers
                                        size={22}
                                        className="
                                            shrink-0
                                            text-secondary
                                        "
                                    />

                                    <span
                                        className="
                                            font-body text-small
                                            font-medium
                                            text-gray-85

                                            md:text-body
                                        "
                                    >
                                        {totalSaves > 0
                                            ? t('explore.saves_count', { count: formattedTotalSaves })
                                            : t('explore.saves_empty')}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-3">
                                    <FaMoneyBillWave
                                        size={22}
                                        className="
                                            shrink-0
                                            text-secondary
                                        "
                                    />

                                    <span
                                        className="
                                            font-body text-small
                                            font-medium
                                            text-gray-85

                                            md:text-body
                                        "
                                    >
                                        {t('explore.price_estimate')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ====================================================
                            MAP PREVIEW
                        ==================================================== */}
                        <div
                            className="
                                flex w-full justify-end
                                lg:w-1/3
                            "
                        >
                            <div
                                className="
                                    w-full max-w-sm
                                    rounded-2xl
                                    bg-white p-2
                                    shadow-lg
                                "
                            >
                                <div
                                    className="
                                        relative h-56 w-full
                                        overflow-hidden
                                        rounded-xl
                                        border border-gray-30
                                        bg-secondary-10
                                    "
                                >
                                    <PlaceMiniMap
                                        latitude={place?.latitude}
                                        longitude={place?.longitude}
                                        name={place?.name}
                                        zoom={16}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================
                GALLERY SECTION
            ======================================================== */}
            <section className="py-12">
                {/* Gallery Header */}
                <div className="mb-10 flex items-center gap-4">
                    <img
                        src="/images/mascots/camera.png"
                        alt="Maskot NuraLoka dengan kamera"
                        className="
                            h-24 w-24 shrink-0
                            -scale-x-100
                            object-contain
                            drop-shadow-md
                        "
                    />

                    <h2
                        className="
                            font-heading text-title
                            font-bold
                            text-primary-100

                            md:text-hero
                        "
                    >
                        {t('explore.gallery_title', { name: place?.name })}
                    </h2>
                </div>

                {/* Masonry Gallery */}
                {gallery.length > 0 ? (
                    <div
                        className="
                            columns-1 gap-4
                            space-y-4

                            sm:columns-2
                            lg:columns-3
                        "
                    >
                        {gallery.map((item, index) => (
                            <div
                                key={item.id}
                                className="
                                    group relative
                                    break-inside-avoid
                                    cursor-pointer
                                    overflow-hidden
                                    rounded-2xl
                                    shadow-md
                                    transition-all duration-300

                                    hover:shadow-xl
                                "
                            >
                                <div
                                    className={`
                                        w-full
                                        bg-gray-30
                                        ${galleryHeights[index % galleryHeights.length]}
                                    `}
                                >
                                    <img
                                        src={item.url}
                                        alt={`${place?.name} potret ${index + 1}`}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = '/images/placeholders/default.jpg';
                                        }}
                                        className="
                                            h-full w-full
                                            object-cover
                                            transition-transform
                                            duration-700

                                            group-hover:scale-105
                                        "
                                    />
                                </div>

                                <div
                                    className="
                                        pointer-events-none
                                        absolute inset-0
                                        bg-black/0
                                        transition-colors
                                        duration-300

                                        group-hover:bg-black/10
                                    "
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="
                            flex flex-col items-center justify-center gap-3
                            rounded-2xl border border-dashed border-gray-30
                            bg-gray-10 py-16 text-center
                        "
                    >
                        <FiMapPin size={32} className="text-gray-50" />
                        <p className="font-body text-body font-medium text-gray-70">
                            {t('explore.gallery_empty_title')}
                        </p>
                        <p className="font-body text-small text-gray-50 max-w-md">
                            {t('explore.gallery_empty_desc')}
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}

Show.layout = (page) => (
    <MainLayout
        pageTitle='Detail Tempat'
        pageDescription="Jelajahi informasi lengkap tentang destinasi wisata, mulai dari lokasi, kategori, hingga inspirasi perjalanan bersama NuraLoka."
        content={page}
    />
);
