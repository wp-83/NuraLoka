import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';

import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiEdit2,
    FiMapPin,
    FiTrash2,
    FiX,
} from 'react-icons/fi';

import { HiOutlineEye } from 'react-icons/hi';

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

function formatViews(count = 0) {
    return Number(count).toLocaleString('id-ID');
}

function getProfileImage(profilePath) {
    return profilePath
        ? `/storage/${profilePath}`
        : '/images/defaults/profile-general.png';
}

function getPhotoPath(photoPath) {
    return photoPath
        ? `/storage/${photoPath}`
        : '/images/defaults/image.png';
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumShow({
    album,
    photos = [],
    isOwner = false,
    author = {},
}) {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const isLightboxOpen = lightboxIndex !== null;
    const hasMultiplePhotos = photos.length > 1;

    // ============================================================
    // LIGHTBOX HANDLERS
    // ============================================================
    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const showPreviousPhoto = () => {
        setLightboxIndex((previous) => {
            if (previous === null) return null;

            return previous > 0
                ? previous - 1
                : photos.length - 1;
        });
    };

    const showNextPhoto = () => {
        setLightboxIndex((previous) => {
            if (previous === null) return null;

            return previous < photos.length - 1
                ? previous + 1
                : 0;
        });
    };

    // ============================================================
    // LIGHTBOX EFFECT
    // ============================================================
    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'Escape':
                    closeLightbox();
                    break;

                case 'ArrowLeft':
                    if (hasMultiplePhotos) {
                        showPreviousPhoto();
                    }
                    break;

                case 'ArrowRight':
                    if (hasMultiplePhotos) {
                        showNextPhoto();
                    }
                    break;

                default:
                    break;
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        isLightboxOpen,
        hasMultiplePhotos,
        photos.length,
    ]);

    // ============================================================
    // ALBUM HANDLERS
    // ============================================================
    const handleBack = () => {
        router.visit(route('album.index'));
    };

    const handleEdit = () => {
        router.visit(
            route('album.edit', album.slug)
        );
    };

    const handleDelete = () => {
        const isConfirmed = window.confirm(
            'Yakin ingin menghapus album ini? Semua foto akan ikut terhapus.'
        );

        if (!isConfirmed) return;

        router.delete(
            route('album.destroy', album.slug)
        );
    };

    const handleToggleVisibility = () => {
        router.post(
            route(
                'album.toggle.visibility',
                album.slug
            ),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <>
            <section className="py-8 pb-12">
                {/* ====================================================
                    TOP BAR
                ==================================================== */}
                <div
                    className="
                        mb-8 flex
                        flex-col gap-5

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    {/* Back */}
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

                    {/* Owner Visibility */}
                    {isOwner ? (
                        <div
                            className="
                                flex flex-col
                                items-start gap-1

                                sm:items-end
                            "
                        >
                            <span
                                className="
                                    font-body text-small
                                    font-semibold text-gray-70
                                "
                            >
                                Visibilitas
                            </span>

                            <button
                                type="button"
                                onClick={handleToggleVisibility}
                                className="
                                    flex items-center gap-2
                                    rounded-lg
                                "
                            >
                                {/* Toggle */}
                                <span
                                    className={`
                                        relative
                                        h-6 w-11
                                        rounded-full
                                        transition-colors
                                        duration-200

                                        ${album.is_public
                                            ? 'bg-primary-100'
                                            : 'bg-gray-30'
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            absolute top-0.5
                                            h-5 w-5
                                            rounded-full
                                            bg-white
                                            shadow
                                            transition-transform
                                            duration-200

                                            ${album.is_public
                                                ? 'translate-x-[22px]'
                                                : 'translate-x-0.5'
                                            }
                                        `}
                                    />
                                </span>

                                <span
                                    className="
                                        font-body text-small
                                        font-medium text-gray-70
                                    "
                                >
                                    {album.is_public
                                        ? 'Publik'
                                        : 'Privat'}
                                </span>
                            </button>
                        </div>
                    ) : (
                        /* Author Information */
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    h-10 w-10
                                    shrink-0
                                    overflow-hidden
                                    rounded-full
                                    border-2 border-primary-30
                                    bg-primary-10
                                "
                            >
                                <img
                                    src={getProfileImage(
                                        author.profile_path
                                    )}
                                    alt={
                                        author.fullname ||
                                        'Pembuat album'
                                    }
                                    className="
                                        h-full w-full
                                        object-cover
                                    "
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            '/images/defaults/profile-general.png';
                                    }}
                                />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        truncate
                                        font-heading text-small
                                        font-bold text-primary-100
                                    "
                                >
                                    {author.fullname ||
                                        'Nuravers'}
                                </p>

                                <p
                                    className="
                                        font-body text-micro
                                        text-gray-50
                                    "
                                >
                                    Pembuat Album
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ====================================================
                    ALBUM INFORMATION
                ==================================================== */}
                <div className="mb-8">
                    {/* Title */}
                    <h1
                        className="
                            mb-4
                            font-heading text-title
                            font-extrabold
                            text-primary-100

                            md:text-hero
                        "
                    >
                        {album.title}
                    </h1>

                    {/* Metadata */}
                    <div
                        className="
                            flex flex-wrap
                            items-center
                            gap-x-5 gap-y-3
                            font-body text-small
                            text-gray-70
                        "
                    >
                        {/* Location */}
                        <span className="flex items-center gap-1.5">
                            <FiMapPin
                                size={16}
                                className="
                                    shrink-0
                                    text-primary-85
                                "
                            />

                            {album.location || '-'}
                        </span>

                        {/* Date */}
                        <span className="flex items-center gap-1.5">
                            <FiCalendar
                                size={16}
                                className="
                                    shrink-0
                                    text-primary-85
                                "
                            />

                            {formatDate(album.date)}
                        </span>

                        {/* Views */}
                        <span className="flex items-center gap-1.5">
                            <HiOutlineEye
                                size={17}
                                className="
                                    shrink-0
                                    text-primary-85
                                "
                            />

                            Dilihat oleh{' '}
                            {formatViews(
                                album.view_count
                            )}{' '}
                            Nuravers
                        </span>
                    </div>
                </div>

                {/* ====================================================
                    OWNER ACTIONS
                ==================================================== */}
                {isOwner && (
                    <div
                        className="
                            mb-8 flex
                            flex-wrap
                            items-center
                            justify-end
                            gap-3
                        "
                    >
                        <Button
                            variant="secondary"
                            size="btn-sm"
                            iconLeft={
                                <FiEdit2 size={15} />
                            }
                            onClick={handleEdit}
                        >
                            Ubah Data
                        </Button>

                        <Button
                            variant="error"
                            size="btn-sm"
                            iconLeft={
                                <FiTrash2 size={15} />
                            }
                            onClick={handleDelete}
                        >
                            Hapus Album
                        </Button>
                    </div>
                )}

                {/* ====================================================
                    PHOTO GALLERY
                ==================================================== */}
                {photos.length > 0 ? (
                    <div
                        className="
                            grid grid-cols-1
                            gap-4

                            md:grid-cols-2
                        "
                    >
                        {photos.map(
                            (photo, index) => {
                                const isLastOddPhoto =
                                    index ===
                                    photos.length - 1 &&
                                    photos.length % 2 !== 0;

                                return (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        onClick={() =>
                                            openLightbox(
                                                index
                                            )
                                        }
                                        className={`
                                            group
                                            overflow-hidden
                                            rounded-2xl
                                            bg-gray-10
                                            text-left
                                            shadow-md
                                            transition-all
                                            duration-300

                                            hover:-translate-y-1
                                            hover:shadow-xl

                                            ${isLastOddPhoto
                                                ? 'md:col-span-2'
                                                : ''
                                            }
                                        `}
                                    >
                                        <div
                                            className={`
                                                w-full
                                                overflow-hidden
                                                bg-gray-10

                                                ${index < 2
                                                    ? 'h-72'
                                                    : 'h-56'
                                                }
                                            `}
                                        >
                                            <img
                                                src={getPhotoPath(
                                                    photo.photo_path
                                                )}
                                                alt={
                                                    photo.filename ||
                                                    `${album.title} - Foto ${index + 1
                                                    }`
                                                }
                                                className="
                                                    h-full w-full
                                                    object-cover
                                                    transition-transform
                                                    duration-500

                                                    group-hover:scale-105
                                                "
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.src =
                                                        '/images/defaults/image.png';
                                                }}
                                            />
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                ) : (
                    /* Empty State */
                    <div
                        className="
                            flex flex-col
                            items-center
                            justify-center
                            rounded-2xl
                            border border-gray-10
                            bg-white
                            px-6 py-16
                            text-center
                        "
                    >
                        <img
                            src="/images/mascots/camera.png"
                            alt="Maskot NuraLoka dengan kamera"
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
                            Belum ada foto dalam album ini.
                        </p>
                    </div>
                )}
            </section>

            {/* ========================================================
                LIGHTBOX
            ======================================================== */}
            {isLightboxOpen && photos[lightboxIndex] && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Pratinjau foto"
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-center
                        justify-center
                        bg-black/80
                        p-4
                        backdrop-blur-sm
                    "
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            closeLightbox();
                        }}
                        className="
                            fixed right-5 top-5
                            z-[110]
                            flex h-11 w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-white/10
                            text-white
                            transition-colors

                            hover:bg-white/20
                        "
                        title="Tutup"
                        aria-label="Tutup pratinjau foto"
                    >
                        <FiX size={26} />
                    </button>

                    {/* Previous */}
                    {hasMultiplePhotos && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showPreviousPhoto();
                            }}
                            className="
                                absolute left-3
                                z-10
                                flex h-10 w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-white/20
                                text-white
                                transition-colors

                                hover:bg-white/30

                                md:left-8
                                md:h-12
                                md:w-12
                            "
                            aria-label="Foto sebelumnya"
                        >
                            <FiChevronLeft size={24} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="
                            flex max-h-[85vh]
                            max-w-[90vw]
                            items-center
                            justify-center
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <img
                            src={getPhotoPath(
                                photos[lightboxIndex]
                                    .photo_path
                            )}
                            alt={
                                photos[lightboxIndex]
                                    .filename ||
                                `${album.title} - Foto ${lightboxIndex + 1
                                }`
                            }
                            className="
                                max-h-[85vh]
                                max-w-full
                                rounded-lg
                                object-contain
                                shadow-2xl
                            "
                            onError={(event) => {
                                event.currentTarget.src =
                                    '/images/defaults/image.png';
                            }}
                        />
                    </div>

                    {/* Next */}
                    {hasMultiplePhotos && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showNextPhoto();
                            }}
                            className="
                                absolute right-3
                                z-10
                                flex h-10 w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-white/20
                                text-white
                                transition-colors

                                hover:bg-white/30

                                md:right-8
                                md:h-12
                                md:w-12
                            "
                            aria-label="Foto berikutnya"
                        >
                            <FiChevronRight size={24} />
                        </button>
                    )}

                    {/* Counter */}
                    <div
                        className="
                            absolute bottom-6
                            left-1/2
                            -translate-x-1/2
                            rounded-full
                            bg-black/40
                            px-4 py-1.5
                            font-body text-small
                            font-medium
                            text-white/80
                        "
                    >
                        {lightboxIndex + 1} / {photos.length}
                    </div>
                </div>
            )}
        </>
    );
}

// ============================================================
// LAYOUT
// ============================================================
AlbumShow.layout = (page) => (
    <MainLayout
        pageTitle="Detail Album"
        pageDescription="Jelajahi album perjalanan dan berbagai momen wisata yang dibagikan oleh komunitas Nuravers di NuraLoka."
        content={page}
    />
);
