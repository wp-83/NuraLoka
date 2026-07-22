import { router } from '@inertiajs/react';
import { FiCalendar, FiImage, FiMapPin } from 'react-icons/fi';
import { useTranslation } from '@js/i18n';

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
// ALBUM CARD
// Compact album card for a grid. The meta line (location, date, photo count) is
// rendered only when that data is present, so the same card works on the Album
// page and on someone else's public profile.
// ============================================================
export default function AlbumCard({ album, showVisibility = false }) {
    const { t } = useTranslation();

    const handleVisit = () => {
        router.visit(route('album.show', { album: album.slug }));
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

                {/* Photo Count */}
                {album.photo_count > 0 && (
                    <span
                        className="
                            absolute right-3 top-3
                            inline-flex items-center gap-1
                            rounded-lg
                            bg-black/60 px-2 py-1
                            font-body text-micro
                            font-bold text-white
                            backdrop-blur-sm
                        "
                    >
                        <FiImage size={12} className="shrink-0" />

                        {album.photo_count}
                    </span>
                )}
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
                    {album.date && (
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
                    )}

                    {/* Visibility */}
                    {showVisibility && (
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
                                ? t('common.public')
                                : t('common.private')}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
