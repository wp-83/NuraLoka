import { useState } from 'react';
import { router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';

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

function getProfileImage(profilePath) {
    return profilePath
        ? `/storage/${profilePath}`
        : '/images/defaults/profile-general.png';
}

// ============================================================
// POPULAR ALBUM CARD
// ============================================================
function PopularAlbumCard({ album }) {
    const handleVisit = () => {
        router.visit(route('album.show', album.slug));
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
                        mb-2 line-clamp-2
                        font-heading text-small
                        font-bold leading-snug
                        text-gray-85
                    "
                >
                    {album.title}
                </h3>

                <div
                    className="
                        mb-1 flex items-center gap-1.5
                        font-body text-micro
                        text-gray-50
                    "
                >
                    <FiUsers size={14} className="shrink-0" />

                    <span className="truncate">
                        {album.author_name}
                    </span>
                </div>

                <div
                    className="
                        mb-4 flex items-center gap-1.5
                        font-body text-micro
                        text-gray-50
                    "
                >
                    <HiOutlineEye size={14} className="shrink-0" />

                    <span>
                        {formatViews(album.view_count)} dilihat
                    </span>
                </div>

                <div className="mt-auto">
                    <Button
                        variant="primary"
                        size="btn-sm"
                        onClick={handleVisit}
                    >
                        Lihat Album
                    </Button>
                </div>
            </div>
        </article>
    );
}

// ============================================================
// MY ALBUM CARD
// ============================================================
function MyAlbumCard({ album, onDelete }) {
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
        router.visit(route('album.show', album.slug));
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
                        font-heading text-small
                        font-bold leading-snug
                        text-gray-85
                    "
                >
                    {album.title}
                </h3>

                {/* Meta */}
                <div
                    className="
                        mb-2 flex flex-wrap
                        items-center gap-x-4 gap-y-2
                        font-body text-micro
                        text-gray-50
                    "
                >
                    <span className="flex min-w-0 items-center gap-1">
                        <FiMapPin size={13} className="shrink-0" />

                        <span className="truncate">
                            {album.location || '-'}
                        </span>
                    </span>

                    <span className="flex items-center gap-1">
                        <FiCalendar size={13} className="shrink-0" />

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
                            font-body text-micro
                            font-medium text-gray-85
                        "
                    >
                        <HiOutlineEye
                            size={17}
                            className="shrink-0 text-accent"
                        />

                        <span>
                            Dilihat oleh{' '}
                            {formatViews(album.view_count)} Nuravers
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
                        <button
                            type="button"
                            onClick={handleToggleVisibility}
                            className="
                                flex items-center gap-2
                                rounded-lg
                                transition-opacity
                                hover:opacity-80
                            "
                            title="Klik untuk mengganti visibilitas"
                        >
                            <span
                                className={`
                                    relative
                                    h-5 w-10
                                    rounded-full
                                    transition-colors duration-200

                                    ${
                                        album.is_public
                                            ? 'bg-primary-100'
                                            : 'bg-gray-30'
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        absolute top-0.5
                                        h-4 w-4
                                        rounded-full
                                        bg-white shadow
                                        transition-transform duration-200

                                        ${
                                            album.is_public
                                                ? 'translate-x-[22px]'
                                                : 'translate-x-0.5'
                                        }
                                    `}
                                />
                            </span>

                            <span
                                className="
                                    font-body text-micro
                                    font-bold text-gray-85
                                "
                            >
                                {album.is_public
                                    ? 'Publik'
                                    : 'Privat'}
                            </span>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleVisit}
                                className="
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    bg-accent text-white
                                    shadow-sm
                                    transition-opacity
                                    hover:opacity-80
                                "
                                title="Lihat detail"
                                aria-label={`Lihat album ${album.title}`}
                            >
                                <HiOutlineEye size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={handleEdit}
                                className="
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    bg-secondary text-white
                                    shadow-sm
                                    transition-opacity
                                    hover:opacity-80
                                "
                                title="Edit album"
                                aria-label={`Edit album ${album.title}`}
                            >
                                <FiEdit2 size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(album.slug)}
                                className="
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    bg-error-dark text-white
                                    shadow-sm
                                    transition-opacity
                                    hover:opacity-80
                                "
                                title="Hapus album"
                                aria-label={`Hapus album ${album.title}`}
                            >
                                <FiTrash2 size={14} />
                            </button>
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
                    {user.province || 'Lokasi tidak tersedia'}
                </p>
            </div>

            <Button
                variant="primary"
                size="btn-sm"
                onClick={handleVisitAlbums}
            >
                Lihat Album
            </Button>
        </article>
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

// ============================================================
// MAIN PAGE
// ============================================================
export default function Index({
    popularAlbums = [],
    myAlbums = [],
    searchResults = null,
    searchQuery = '',
}) {
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

    const handleDelete = (albumSlug) => {
        const isConfirmed = window.confirm(
            'Yakin ingin menghapus album ini?'
        );

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
                        h-24 w-24
                        shrink-0 object-contain
                    "
                />

                <div>
                    <h1
                        className="
                            font-heading text-title
                            font-extrabold
                            text-primary-100

                            md:text-hero
                        "
                    >
                        Album Nuravers
                    </h1>

                    <p
                        className="
                            font-heading text-body
                            font-medium italic
                            text-primary-70
                        "
                    >
                        Albumipun Nuravers
                    </p>
                </div>
            </div>

            {/* ========================================================
                SEARCH
            ======================================================== */}
            <form
                onSubmit={handleSearch}
                className="relative mb-8"
            >
                <div
                    className="
                        flex items-center
                        overflow-hidden
                        rounded-xl
                        border border-gray-30
                        bg-white
                        shadow-sm
                        transition-shadow
                        focus-within:border-primary-50
                        focus-within:shadow-md
                        hover:shadow-md
                    "
                >
                    <div className="pl-4 text-gray-50">
                        <FiSearch size={20} />
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Masukkan nama Nuravers lain untuk melihat koleksi album mereka..."
                        className="
                            w-full
                            border-none bg-transparent
                            px-3 py-3
                            font-body text-small
                            text-gray-85
                            outline-none
                            focus:ring-0
                        "
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="
                                p-4
                                text-gray-50
                                transition-colors
                                hover:text-gray-85
                            "
                            aria-label="Hapus pencarian"
                        >
                            <FiX size={18} />
                        </button>
                    )}
                </div>
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
                            title="Tidak ditemukan Nuravers dengan nama tersebut."
                        />
                    )}
                </section>
            ) : (
                <>
                    {/* ====================================================
                        POPULAR ALBUMS
                    ==================================================== */}
                    <section className="mb-10">
                        <div
                            className="
                                rounded-2xl
                                border border-primary-30/30
                                bg-gradient-to-r
                                from-primary-10
                                to-warning-light
                                p-6
                            "
                        >
                            <h2
                                className="
                                    mb-5
                                    font-heading text-subtitle
                                    font-bold text-primary-100
                                "
                            >
                                Album Populer Minggu Ini
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
                                    title="Belum ada album populer minggu ini."
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
                                Album Kamu
                            </h2>

                            <Button
                                variant="primary"
                                size="btn-sm"
                                onClick={handleCreateAlbum}
                            >
                                Tambah Album Baru
                            </Button>
                        </div>

                        {/* Albums */}
                        {myAlbums.length > 0 ? (
                            <div
                                className="
                                    grid grid-cols-1
                                    gap-5

                                    sm:grid-cols-2
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
                                    title="Kamu belum memiliki album."
                                    description="Ayo mulai dokumentasikan perjalananmu!"
                                />
                            </div>
                        )}

                        {/* View All */}
                        {myAlbums.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="primary"
                                    size="btn-sm"
                                    onClick={handleViewAllAlbums}
                                >
                                    Lihat Semua Album
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
        pageTitle="Album"
        pageDescription="Jelajahi album perjalanan dari komunitas Nuravers, temukan cerita wisata dari pengguna lain, dan dokumentasikan pengalaman perjalananmu sendiri bersama NuraLoka."
        content={page}
    />
);
