import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';
import { useTranslation } from '@js/i18n';

import {
    FiChevronLeft,
    FiPlus,
    FiX,
    FiSearch,
    FiMapPin,
    FiLock,
} from 'react-icons/fi';

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumEdit({
    album,
    photos: initialPhotos = [],
}) {
    const { t } = useTranslation();
    const [photos, setPhotos] = useState(initialPhotos);
    const fileInputRef = useRef(null);

    // Album sistem (perjalanan 2 titik): dibuat otomatis — judul, lokasi, dan
    // tanggal terkunci. User hanya boleh menambah/menghapus foto.
    const isSystem = album?.is_system ?? false;

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        title: album?.title || '',
        location: album?.location || '',
        date: album?.date || '',
        is_public: album?.is_public ?? true,
    });

    const maxDate = new Date()
        .toISOString()
        .split('T')[0];

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleBack = () => {
        router.visit(
            route('album.show', album.slug)
        );
    };

    useEffect(() => {
        if (!showLocationDropdown || !data.location) {
            setLocationSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(`/album/lokasi/cari?q=${encodeURIComponent(data.location)}`)
                .then(res => res.json())
                .then(places => setLocationSuggestions(places))
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [data.location, showLocationDropdown]);

    const handleToggleVisibility = () => {
        router.post(
            route(
                'album.toggle.visibility',
                album.slug
            ),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    setData(
                        'is_public',
                        !data.is_public
                    );
                },
            }
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isSystem) return; // info album sistem terkunci

        put(
            route(
                'album.update',
                album.slug
            ),
            {
                preserveScroll: true,
            }
        );
    };

    const handleAddPhotos = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (files.length === 0) return;

        const formData = new FormData();

        files.forEach((file) => {
            formData.append(
                'photos[]',
                file
            );
        });

        router.post(
            route(
                'album.photo.add',
                album.slug
            ),
            formData,
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: (page) => {
                    setPhotos(page.props.photos);
                },
            }
        );

        event.target.value = '';
    };

    const handleRemovePhoto = (photoId) => {
        const isConfirmed = window.confirm(
            t('album.delete_photo_confirm')
        );

        if (!isConfirmed) return;

        router.delete(
            route(
                'album.photo.remove',
                photoId
            ),
            {
                preserveScroll: true,

                onSuccess: () => {
                    setPhotos((previous) =>
                        previous.filter(
                            (photo) =>
                                photo.id !== photoId
                        )
                    );
                },
            }
        );
    };

    return (
        <section className="py-8 pb-12">
            {/* ========================================================
                TOP BAR
            ======================================================== */}
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
                    {t('common.back')}
                </Button>

                {/* Visibility */}
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
                        {t('album.field_visibility')}
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
                                relative inline-flex
                                h-6 w-11
                                items-center
                                rounded-full
                                border-2
                                transition-colors
                                duration-300

                                ${
                                    data.is_public
                                        ? 'border-primary-100 bg-primary-30'
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
                                    transition-all
                                    duration-300

                                    ${
                                        data.is_public
                                            ? 'translate-x-[22px] bg-primary-100'
                                            : 'translate-x-[3px] bg-gray-50'
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
                            {data.is_public
                                ? t('common.public')
                                : t('common.private')}
                        </span>
                    </button>
                </div>
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
                    {t('album.edit_meta_title')}
                </h1>

                <p
                    className="
                        mt-2 max-w-2xl
                        font-body text-body
                        text-gray-50
                    "
                >
                    Perbarui informasi dan kelola foto
                    dalam album perjalananmu.
                </p>
            </div>

            {/* ========================================================
                FORM
            ======================================================== */}
            <form
                onSubmit={handleSubmit}
                className="
                    rounded-2xl
                    border border-gray-10
                    bg-white
                    p-5 shadow-sm

                    sm:p-6
                    lg:p-8
                "
            >
                {/* ====================================================
                    ALBUM INFORMATION
                ==================================================== */}
                <div className="mb-8">
                    <h2
                        className="
                            mb-5
                            font-heading text-paragraph
                            font-semibold text-primary-100
                        "
                    >
                        Informasi Album
                    </h2>

                    {/* Locked notice for system-generated (2-point journey) albums */}
                    {isSystem && (
                        <div
                            className="
                                mb-5 flex items-start gap-3
                                rounded-xl
                                border border-primary-30
                                bg-primary-10/50
                                px-4 py-3
                            "
                        >
                            <FiLock
                                size={16}
                                className="mt-0.5 shrink-0 text-primary-100"
                            />
                            <p
                                className="
                                    font-body text-micro
                                    text-gray-70
                                "
                            >
                                Album ini dibuat otomatis oleh sistem dari
                                perjalanan 2 titik. Judul, lokasi, dan tanggal
                                terkunci dan tidak dapat diubah — kamu hanya dapat
                                menambah atau menghapus foto.
                            </p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="mb-5">
                        <label
                            htmlFor="title"
                            className="
                                mb-1.5 block
                                font-heading text-small
                                font-semibold text-gray-85
                            "
                        >
                            {t('album.field_title')}

                            <span className="ml-1 text-error-dark">
                                *
                            </span>
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData(
                                    'title',
                                    event.target.value
                                )
                            }
                            required={!isSystem}
                            disabled={isSystem}
                            placeholder={t('album.field_title_placeholder')}
                            className={`
                                w-full
                                rounded-lg
                                border border-gray-30
                                px-4 py-2.5
                                font-body text-small
                                text-gray-85
                                outline-none
                                transition-all

                                placeholder:text-gray-30

                                focus:border-primary-85
                                focus:ring-2
                                focus:ring-primary-30

                                ${
                                    isSystem
                                        ? 'cursor-not-allowed bg-gray-10 text-gray-50'
                                        : 'bg-white'
                                }
                            `}
                        />

                        {errors.title && (
                            <p
                                className="
                                    mt-1
                                    font-body text-micro
                                    text-error-dark
                                "
                            >
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Location & Date */}
                    <div
                        className="
                            grid grid-cols-1
                            gap-5

                            md:grid-cols-2
                        "
                    >
                        {/* Location */}
                        <div>
                            <label
                                htmlFor="location"
                                className="
                                    mb-1.5 block
                                    font-heading text-small
                                    font-semibold text-gray-85
                                "
                            >
                                {t('album.field_location')}

                                <span className="ml-1 text-error-dark">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <FiSearch className="text-gray-40" />
                                </div>
                                <input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(event) => {
                                        setData('location', event.target.value);
                                        setShowLocationDropdown(true);
                                    }}
                                    onFocus={() => !isSystem && setShowLocationDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                    required={!isSystem}
                                    disabled={isSystem}
                                    placeholder={t('album.field_location_placeholder')}
                                    className={`
                                        w-full
                                        rounded-full
                                        border-2 border-primary-30
                                        pl-11 pr-4 py-2.5
                                        font-body text-small
                                        text-gray-85
                                        outline-none
                                        transition-all

                                        placeholder:text-gray-40

                                        focus:border-primary-100
                                        focus:ring-0

                                        ${
                                            isSystem
                                                ? 'cursor-not-allowed bg-gray-10 text-gray-50'
                                                : 'bg-white'
                                        }
                                    `}
                                />

                                {/* Dropdown Suggestions */}
                                {!isSystem && showLocationDropdown && locationSuggestions.length > 0 && (
                                    <div className="
                                        absolute z-20 w-full mt-2
                                        bg-white rounded-2xl
                                        border border-gray-30 shadow-lg
                                        overflow-hidden
                                    ">
                                        {locationSuggestions.map((place) => (
                                            <button
                                                key={place.id}
                                                type="button"
                                                onClick={() => {
                                                    setData('location', place.name);
                                                    setShowLocationDropdown(false);
                                                }}
                                                className="
                                                    w-full flex items-start gap-3
                                                    px-4 py-3
                                                    text-left
                                                    hover:bg-primary-10
                                                    transition-colors
                                                    border-b border-gray-20 last:border-0
                                                "
                                            >
                                                <div className="pt-0.5">
                                                    <FiMapPin className="text-gray-50" />
                                                </div>
                                                <div>
                                                    <p className="font-heading text-small font-bold text-secondary-100">
                                                        {place.name}
                                                    </p>
                                                    <p className="font-body text-micro text-gray-50 line-clamp-1">
                                                        {place.address}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {errors.location && (
                                <p
                                    className="
                                        mt-1
                                        font-body text-micro
                                        text-error-dark
                                    "
                                >
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label
                                htmlFor="date"
                                className="
                                    mb-1.5 block
                                    font-heading text-small
                                    font-semibold text-gray-85
                                "
                            >
                                {t('album.field_date')}

                                <span className="ml-1 text-error-dark">
                                    *
                                </span>
                            </label>

                            <input
                                id="date"
                                type="date"
                                max={maxDate}
                                value={data.date}
                                onChange={(event) =>
                                    setData(
                                        'date',
                                        event.target.value
                                    )
                                }
                                required={!isSystem}
                                disabled={isSystem}
                                className={`
                                    w-full
                                    rounded-lg
                                    border border-gray-30
                                    px-4 py-2.5
                                    font-body text-small
                                    text-gray-85
                                    outline-none
                                    transition-all

                                    focus:border-primary-85
                                    focus:ring-2
                                    focus:ring-primary-30

                                    ${
                                        isSystem
                                            ? 'cursor-not-allowed bg-gray-10 text-gray-50'
                                            : 'bg-white'
                                    }
                                `}
                            />

                            {errors.date && (
                                <p
                                    className="
                                        mt-1
                                        font-body text-micro
                                        text-error-dark
                                    "
                                >
                                    {errors.date}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ====================================================
                    PHOTOS
                ==================================================== */}
                <div className="mb-8">
                    {/* Header */}
                    <div
                        className="
                            mb-4 flex
                            flex-col gap-3

                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div>
                            <h2
                                className="
                                    font-heading text-paragraph
                                    font-semibold text-primary-100
                                "
                            >
                                {t('album.photos_label')}
                            </h2>

                            <p
                                className="
                                    mt-1
                                    font-body text-micro
                                    text-gray-50
                                "
                            >
                                Tambah atau hapus foto yang
                                terdapat di dalam album ini.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="btn-sm"
                            iconLeft={
                                <FiPlus size={15} />
                            }
                            onClick={handleAddPhotos}
                        >
                            Tambah Foto
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="
                                image/jpeg,
                                image/png,
                                image/jpg,
                                image/webp
                            "
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Photo Error */}
                    {errors.photos && (
                        <p
                            className="
                                mb-3
                                font-body text-micro
                                text-error-dark
                            "
                        >
                            {errors.photos}
                        </p>
                    )}

                    {/* Photo List */}
                    {photos.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="
                                        flex items-center
                                        gap-4
                                        rounded-xl
                                        border border-gray-10
                                        bg-white
                                        p-3
                                        shadow-sm
                                        transition-shadow

                                        hover:shadow-md
                                    "
                                >
                                    {/* Preview */}
                                    <div
                                        className="
                                            h-20 w-28
                                            shrink-0
                                            overflow-hidden
                                            rounded-lg
                                            bg-gray-10
                                        "
                                    >
                                        <img
                                            src={`/storage/${photo.photo_path}`}
                                            alt={
                                                photo.filename ||
                                                `Foto ${album.title}`
                                            }
                                            className="
                                                h-full w-full
                                                object-cover
                                            "
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    '/images/defaults/image.png';
                                            }}
                                        />
                                    </div>

                                    {/* Information */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="
                                                truncate
                                                font-body text-small
                                                font-medium
                                                text-gray-85
                                            "
                                        >
                                            {photo.filename ||
                                                'Foto Album'}
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemovePhoto(
                                                photo.id
                                            )
                                        }
                                        className="
                                            flex h-9 w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-error-light
                                            text-error
                                            transition-colors

                                            hover:bg-error
                                            hover:text-white
                                        "
                                        title={t('album.delete_photo')}
                                        aria-label={`${t('album.delete_photo')} ${
                                            photo.filename ||
                                            ''
                                        }`}
                                    >
                                        <FiX size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddPhotos}
                            className="
                                flex w-full
                                flex-col
                                items-center
                                justify-center
                                rounded-2xl
                                border-2
                                border-dashed
                                border-gray-30
                                bg-gray-10/50
                                px-6 py-12
                                text-center
                                transition-colors

                                hover:border-primary-50
                                hover:bg-primary-10/30
                            "
                        >
                            <div
                                className="
                                    mb-3 flex
                                    h-12 w-12
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-primary-10
                                    text-primary
                                "
                            >
                                <FiPlus size={24} />
                            </div>

                            <p
                                className="
                                    font-body text-small
                                    font-semibold
                                    text-gray-70
                                "
                            >
                                Belum ada foto
                            </p>

                            <p
                                className="
                                    mt-1
                                    font-body text-micro
                                    text-gray-50
                                "
                            >
                                Klik untuk menambahkan foto
                                ke dalam album ini.
                            </p>
                        </button>
                    )}
                </div>

                {/* ====================================================
                    SUBMIT — hanya untuk album non-sistem (info dapat diubah)
                ==================================================== */}
                {!isSystem && (
                    <div
                        className="
                            flex justify-end
                            border-t border-gray-10
                            pt-6
                        "
                    >
                        <Button
                            type="submit"
                            variant="primary"
                            size="btn-md"
                            loading={processing}
                            disabled={processing}
                        >
                            {t('common.save_changes')}
                        </Button>
                    </div>
                )}
            </form>
        </section>
    );
}

// ============================================================
// LAYOUT
// ============================================================
AlbumEdit.layout = (page) => (
    <MainLayout
        pageTitle="Edit Album"
        pageDescription="Perbarui informasi, visibilitas, dan koleksi foto dalam album perjalananmu di NuraLoka agar setiap momen dan pengalaman wisata tetap tersimpan dengan baik."
        content={page}
    />
);
