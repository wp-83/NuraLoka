import { router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';

import {
    FiCalendar,
    FiChevronLeft,
    FiMapPin,
} from 'react-icons/fi';

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateString) {
    if (!dateString) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(dateString));
}

function getAlbumThumbnail(thumbnail) {
    return thumbnail
        ? `/storage/${thumbnail}`
        : '/images/defaults/image.png';
}

// ============================================================
// SIMPLE ALBUM CARD
// ============================================================
function SimpleAlbumCard({ album }) {
    const handleVisit = () => {
        router.visit(route('album.show', album.slug));
    };

    return (
        <article
            onClick={handleVisit}
            className="
                group flex cursor-pointer flex-col
                overflow-hidden rounded-2xl
                border border-gray-10
                bg-white shadow-sm
                transition-all duration-300

                hover:-translate-y-1
                hover:shadow-md
            "
        >
            {/* Thumbnail */}
            <div
                className="
                    relative h-44
                    overflow-hidden
                    bg-gray-10
                "
            >
                <img
                    src={getAlbumThumbnail(album.thumbnail)}
                    alt={album.title}
                    className="
                        h-full w-full
                        object-cover
                        transition-transform duration-500

                        group-hover:scale-105
                    "
                    onError={(event) => {
                        event.currentTarget.src =
                            '/images/defaults/image.png';
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Title */}
                <h3
                    className="
                        mb-3 line-clamp-2
                        font-heading text-small
                        font-bold leading-snug
                        text-gray-85
                        transition-colors

                        group-hover:text-primary-100
                    "
                >
                    {album.title}
                </h3>

                {/* Location */}
                {album.location && (
                    <div
                        className="
                            mb-1.5 flex
                            items-center gap-1.5
                            font-body text-micro
                            text-gray-50
                        "
                    >
                        <FiMapPin
                            size={14}
                            className="shrink-0"
                        />

                        <span className="truncate">
                            {album.location}
                        </span>
                    </div>
                )}

                {/* Bottom Information */}
                <div
                    className="
                        mt-auto flex
                        items-center justify-between
                        gap-3 pt-2
                    "
                >
                    {/* Date */}
                    <div
                        className="
                            flex min-w-0
                            items-center gap-1.5
                            font-body text-micro
                            text-gray-50
                        "
                    >
                        <FiCalendar
                            size={14}
                            className="shrink-0"
                        />

                        <span className="truncate">
                            {formatDate(album.date)}
                        </span>
                    </div>

                    {/* Visibility */}
                    <span
                        className={`
                            inline-flex shrink-0
                            items-center gap-1.5
                            rounded-full
                            px-2 py-1
                            font-body text-micro
                            font-semibold

                            ${
                                album.is_public
                                    ? 'bg-success-light text-success-dark'
                                    : 'bg-warning-light text-warning-dark'
                            }
                        `}
                    >
                        <span
                            className={`
                                h-1.5 w-1.5
                                rounded-full

                                ${
                                    album.is_public
                                        ? 'bg-success'
                                        : 'bg-warning'
                                }
                            `}
                        />

                        {album.is_public
                            ? 'Publik'
                            : 'Privat'}
                    </span>
                </div>
            </div>
        </article>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ ownerName }) {
    const message = ownerName
        ? `${ownerName} belum memiliki album publik.`
        : 'Kamu belum memiliki album.';

    return (
        <div
            className="
                flex flex-col
                items-center justify-center
                rounded-3xl
                border border-gray-10
                bg-white
                px-6 py-20
                text-center
                shadow-sm
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
                    text-gray-50
                "
            >
                {message}
            </p>
        </div>
    );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumAll({
    albums = [],
    pageTitle = 'Semua Album Kamu',
    ownerName = null,
}) {
    const handleBack = () => {
        router.visit(route('album.index'));
    };

    return (
        <section className="py-8 pb-12">
            {/* ========================================================
                TOP NAVIGATION
            ======================================================== */}
            <div className="mb-6">
                <Button
                    variant="primary"
                    size="btn-sm"
                    onClick={handleBack}
                    iconLeft={
                        <FiChevronLeft size={16} />
                    }
                >
                    Kembali
                </Button>
            </div>

            {/* ========================================================
                PAGE HEADER
            ======================================================== */}
            <div className="mb-8">
                <h1
                    className="
                        font-heading text-title
                        font-extrabold
                        text-primary-100

                        md:text-hero
                    "
                >
                    {pageTitle}
                </h1>

                {ownerName && (
                    <p
                        className="
                            mt-2
                            font-body text-body
                            text-primary-70
                        "
                    >
                        Jelajahi koleksi album perjalanan dari{' '}
                        <span className="font-bold">
                            {ownerName}
                        </span>
                    </p>
                )}
            </div>

            {/* ========================================================
                ALBUM GRID
            ======================================================== */}
            {albums.length > 0 ? (
                <div
                    className="
                        grid grid-cols-1
                        gap-5

                        sm:grid-cols-2
                        md:grid-cols-3
                        lg:grid-cols-4
                    "
                >
                    {albums.map((album) => (
                        <SimpleAlbumCard
                            key={album.id}
                            album={album}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState ownerName={ownerName} />
            )}
        </section>
    );
}

// ============================================================
// LAYOUT
// ============================================================
AlbumAll.layout = (page) => (
    <MainLayout
        pageTitle="Semua Album"
        pageDescription="Jelajahi koleksi album perjalanan dan temukan berbagai cerita serta pengalaman wisata bersama komunitas Nuravers di NuraLoka."
        content={page}
    />
);
