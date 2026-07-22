import { useState } from 'react';
import { router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import EmptyState from '@components/Common/EmptyState';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import { useConfirm } from '@js/Contexts/ConfirmContext';
import { useTranslation } from '@js/i18n';

import {
    FiCalendar,
    FiEdit2,
    FiMapPin,
    FiSearch,
    FiTrash2,
    FiUsers,
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

function getAlbumThumbnail(thumbnail) {
    return thumbnail
        ? `/storage/${thumbnail}`
        : '/images/defaults/image.png';
}

// The server already sends a finished profile photo URL
// (User::public_profile_photo), including the gender-appropriate default avatar.
// Do not prepend /storage/ again.
function getProfileImage(profileUrl) {
    return profileUrl || '/images/defaults/profile-general.png';
}

// ============================================================
// POPULAR ALBUM CARD
// ============================================================
function PopularAlbumCard({ album }) {
    const { t } = useTranslation();
    const handleVisit = () => {
        router.visit(route('album.show', { album: album.slug }));
    };

    return (
        <article
            className="
                group flex flex-col
                overflow-hidden rounded-2xl
                bg-white shadow-md
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
            "
        >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={getAlbumThumbnail(album.thumbnail)}
                    alt={album.title}
                    className="
                        h-full w-full object-cover
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
                <h3
                    className="
                        mb-6 line-clamp-2
                        font-heading text-subtitle
                        font-bold leading-snug
                        text-primary
                    "
                >
                    {album.title}
                </h3>

                <div
                    className="
                        mb-1 flex items-center gap-1.5
                        font-body text-body
                        text-secondary
                    "
                >
                    <FiUsers size={20} className="shrink-0" />

                    <span className="truncate">
                        {album.author_name}
                    </span>
                </div>

                <div
                    className="
                        mb-4 flex items-center gap-1.5
                        font-body text-body
                        text-secondary
                    "
                >
                    <HiOutlineEye size={20} className="shrink-0" />

                    <span>
                        {t('album.views_count', { count: formatViews(album.view_count) })}
                    </span>
                </div>

                <div className="mt-auto">
                    <Button
                        variant="primary"
                        size="btn-md"
                        fullWidth={true}
                        onClick={handleVisit}
                    >
                        {t('common.view_detail')}
                    </Button>
                </div>
            </div>
        </article>
    );
}

// ============================================================
// MY ALBUM CARD
// ============================================================
function    MyAlbumCard({ album, onDelete }) {
    const { t } = useTranslation();
    const handleToggleVisibility = () => {
        router.post(
            route('album.toggle.visibility', album.slug),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleVisit = () => {
        router.visit(route('album.show', { album: album.slug }));
    };

    const handleEdit = () => {
        router.visit(route('album.edit', album.slug));
    };

    return (
        <article
            className="
                group overflow-hidden
                rounded-2xl bg-white
                shadow-md
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
            "
        >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getAlbumThumbnail(album.thumbnail)}
                    alt={album.title}
                    className="
                        h-full w-full object-cover
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
            <div className="p-4">
                {/* Title */}
                <h3
                    className="
                        mb-2 line-clamp-2
                        font-heading text-subtitle
                        font-bold leading-snug
                        text-primary


                    "
                >
                    {album.title}
                </h3>

                {/* Meta */}
                <div
                    className="
                        mb-2 flex flex-wrap
                        items-center gap-x-8 gap-y-2
                        font-body text-body
                        text-secondary
                    "
                >
                    <span className="flex min-w-0 items-center gap-1">
                        <FiMapPin size={20} className="shrink-0" />

                        <span className="truncate">
                            {album.location || '-'}
                        </span>
                    </span>

                    <span className="flex items-center gap-1">
                        <FiCalendar size={20} className="shrink-0" />

                        {formatDate(album.date)}
                    </span>
                </div>

                {/* Bottom Information */}
                <div
                    className="
                        mt-4 flex flex-col
                        gap-4

                        xl:flex-row
                        xl:items-center
                        xl:justify-between
                    "
                >
                    {/* Views */}
                    <div
                        className="
                            flex items-center gap-1.5
                            font-body text-small
                            font-medium text-gray-100
                        "
                    >
                        <HiOutlineEye
                            size={20}
                            className="shrink-0 text-accent"
                        />

                        <span>
                            {t('album.viewers_count', { count: formatViews(album.view_count) })}
                        </span>
                    </div>

                    <div
                        className="
                            flex flex-wrap
                            items-center justify-between
                            gap-3

                            xl:justify-end
                        "
                    >
                        {/* Visibility Toggle */}
                        <Button
                            unstyled
                            onClick={handleToggleVisibility}
                            className="
                                flex items-center gap-2
                                rounded-lg
                                transition-opacity
                                hover:opacity-80
                            "
                            title={t('album.toggle_visibility')}
                        >
                            <span
                                className={`
                                    relative inline-flex
                                    h-6 w-11
                                    items-center
                                    rounded-full
                                    border-2
                                    transition-colors duration-300

                                    ${album.is_public
                                        ? 'border-primary-100 bg-primary-10'
                                        : 'border-gray-30 bg-gray-10'
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        inline-block
                                        h-4 w-4
                                        rounded-full
                                        shadow-md
                                        transition-all duration-300

                                        ${album.is_public
                                            ? 'translate-x-[22px] bg-primary-100'
                                            : 'translate-x-[3px] bg-gray-50'
                                        }
                                    `}
                                />
                            </span>

                            <span
                                className="
                                    font-body text-small
                                    font-bold text-gray-85
                                "
                            >
                                {album.is_public
                                    ? t('common.public')
                                    : t('common.private')}
                            </span>
                        </Button>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                            <Button
                                onClick={handleVisit}
                                variant="primary"
                                size="btn-sm"
                                className="shadow-sm"
                                iconLeft={<HiOutlineEye size={20} />}
                                title={t('album.view_detail')}
                                aria-label={`${t('album.view_detail')} ${album.title}`}
                            />

                            <Button
                                onClick={handleEdit}
                                variant="secondary"
                                size="btn-sm"
                                className="shadow-sm"
                                iconLeft={<FiEdit2 size={20} />}
                                title={t('album.edit_title')}
                                aria-label={`${t('album.edit_title')} ${album.title}`}
                            />

                            <Button
                                onClick={() => onDelete(album.slug)}
                                variant="error"
                                size="btn-sm"
                                className="shadow-sm"
                                iconLeft={<FiTrash2 size={20} />}
                                title={t('album.delete_title')}
                                aria-label={`${t('album.delete_title')} ${album.title}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

// ============================================================
// USER SEARCH RESULT
// ============================================================
function UserSearchResult({ user }) {
    const { t } = useTranslation();
    const handleVisitAlbums = () => {
        router.visit(
            route('album.user.albums', user.id)
        );
    };

    return (
        <article
            className="
                flex items-center gap-4
                rounded-xl
                border border-gray-10
                bg-white px-5 py-4
                shadow-sm
                transition-shadow
                hover:shadow-md
            "
        >
            {/* Profile Image */}
            <div
                className="
                    h-14 w-14 shrink-0
                    overflow-hidden rounded-full
                    border-2 border-primary-30
                    bg-primary-10
                "
            >
                <img
                    src={getProfileImage(user.profile_path)}
                    alt={user.fullname}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.src =
                            '/images/defaults/profile-general.png';
                    }}
                />
            </div>

            {/* User Information */}
            <div className="min-w-0 flex-1">
                <h3
                    className="
                        truncate
                        font-heading text-body
                        font-bold text-primary-100
                    "
                >
                    {user.fullname}
                </h3>

                <p
                    className="
                        truncate
                        font-body text-small
                        text-gray-50
                    "
                >
                    {user.province || t('album.location_unavailable')}
                </p>
            </div>

            <Button
                variant="primary"
                size="btn-sm"
                onClick={handleVisitAlbums}
            >
                {t('common.view_detail')}
            </Button>
        </article>
    );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Index({
    popularAlbums = [],
    myAlbums = [],
    searchResults = null,
    searchQuery = '',
}) {
    const { t } = useTranslation();
    const confirm = useConfirm();
    const [search, setSearch] = useState(searchQuery);

    const isSearching = searchResults !== null;

    const handleSearch = (event) => {
        event.preventDefault();

        const query = search.trim();

        if (!query) return;

        router.get(
            route('album.index'),
            {
                search: query,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleClearSearch = () => {
        setSearch('');

        router.get(
            route('album.index'),
            {},
            {
                preserveState: false,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = async (albumSlug) => {
        const isConfirmed = await confirm({
            title: t('album.delete_title'),
            message: t('album.delete_confirm'),
        });

        if (!isConfirmed) return;

        router.delete(
            route('album.destroy', albumSlug),
            {
                preserveScroll: true,
            }
        );
    };

    const handleCreateAlbum = () => {
        router.visit(route('album.create'));
    };

    const handleViewAllAlbums = () => {
        router.visit(route('album.all'));
    };

    return (
        <section className="py-10">
            {/* ========================================================
                PAGE HEADER
            ======================================================== */}
            <div
                className="
                    mb-8 flex
                    items-center gap-4
                "
            >
                <img
                    src="/images/mascots/camera.png"
                    alt="Maskot NuraLoka dengan kamera"
                    className="
                        h-32 w-32
                        shrink-0 object-contain
                    "
                />

                <div>
                    <h1
                        className="
                            font-heading text-title
                            font-bold
                            text-primary-100

                            md:text-hero
                        "
                    >
                        {t('album.meta_title')} {t('common.community')}
                    </h1>

                    <RegionalGreeting
                        phrase="album_index"
                        className="local-language text-paragraph"
                    />
                </div>
            </div>

            {/* ========================================================
                SEARCH
            ======================================================== */}
            <form
                onSubmit={handleSearch}
                className="relative mb-8"
            >
                <Input
                    name="search"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder={t('album.search_placeholder')}
                    icon={<FiSearch size={18} />}
                    iconRight={
                        search && (
                            <Button
                                unstyled
                                onClick={handleClearSearch}
                                className="
                                    text-gray-50
                                    transition-colors
                                    hover:text-gray-85
                                "
                                aria-label="Hapus pencarian"
                            >
                                <FiX size={18} />
                            </Button>
                        )
                    }
                />
            </form>

            {/* ========================================================
                SEARCH RESULTS
            ======================================================== */}
            {isSearching ? (
                <section className="mb-10">
                    <p
                        className="
                            mb-4 text-right
                            font-body text-small
                            text-gray-50
                        "
                    >
                        Ditemukan {searchResults.length} hasil
                    </p>

                    {searchResults.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {searchResults.map((user) => (
                                <UserSearchResult
                                    key={user.id}
                                    user={user}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('album.not_found')}
                        />
                    )}
                </section>
            ) : (
                <>
                    {/* ====================================================
                        POPULAR ALBUMS
                    ==================================================== */}
                    <section className="mb-20 mt-12">
                        <div>
                            <h2
                                className="
                                    mb-5
                                    font-heading text-subtitle
                                    font-bold text-primary-100
                                "
                            >
                                {t('album.popular_title')}
                            </h2>

                            {popularAlbums.length > 0 ? (
                                <div
                                    className="
                                        grid grid-cols-1
                                        gap-5

                                        sm:grid-cols-2
                                        lg:grid-cols-3
                                    "
                                >
                                    {popularAlbums.map((album) => (
                                        <PopularAlbumCard
                                            key={album.id}
                                            album={album}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title={t('album.popular_empty')}
                                />
                            )}
                        </div>
                    </section>

                    {/* ====================================================
                        MY ALBUMS
                    ==================================================== */}
                    <section className="mb-10">
                        {/* Header */}
                        <div
                            className="
                                mb-5 flex
                                flex-col gap-4

                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <h2
                                className="
                                    font-heading text-subtitle
                                    font-bold text-primary-100
                                "
                            >
                                {t('album.my_albums_title')}
                            </h2>

                            <Button
                                variant="primary"
                                size="btn-md"
                                onClick={handleCreateAlbum}
                            >
                                {t('album.create_submit')}
                            </Button>
                        </div>

                        {/* Albums */}
                        {myAlbums.length > 0 ? (
                            <div
                                className="
                                    grid grid-cols-1
                                    gap-5

                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >
                                {myAlbums.map((album) => (
                                    <MyAlbumCard
                                        key={album.id}
                                        album={album}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="
                                    rounded-2xl
                                    border border-gray-10
                                    bg-white
                                "
                            >
                                <EmptyState
                                    title={t('album.my_empty')}
                                    description={t('album.start_cta')}
                                />
                            </div>
                        )}

                        {/* View All */}
                        {myAlbums.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="primary"
                                    size="btn-md"
                                    onClick={handleViewAllAlbums}
                                >
                                    {t('common.see_all')}
                                </Button>
                            </div>
                        )}
                    </section>
                </>
            )}
        </section>
    );
}

// ============================================================
// LAYOUT
// ============================================================
Index.layout = (page) => (
    <MainLayout
        pageTitle="title.album"
        pageDescription="Jelajahi album perjalanan dari komunitas Nuravers, temukan cerita wisata dari pengguna lain, dan dokumentasikan pengalaman perjalananmu sendiri bersama NuraLoka."
        content={page}
    />
);
