import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import { useTranslation } from '@js/i18n';

import {
    FiChevronLeft,
    FiPlus,
    FiX,
    FiSearch,
    FiMapPin,
} from 'react-icons/fi';

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumCreate() {
    const { t } = useTranslation();
    const [previewPhotos, setPreviewPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        title: '',
        location: '',
        place_id: null,
        date: '',
        is_public: true,
        photos: [],
    });

    const maxDate = new Date()
        .toISOString()
        .split('T')[0];

    // ============================================================
    // CLEANUP PREVIEW URLS
    // ============================================================
    useEffect(() => {
        return () => {
            previewPhotos.forEach((photo) => {
                URL.revokeObjectURL(photo.preview);
            });
        };
    }, [previewPhotos]);

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleBack = () => {
        router.visit(route('album.index'));
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
        setData('is_public', !data.is_public);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route('album.store'), {
            forceFormData: true,
        });
    };

    const handleAddPhotos = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (files.length === 0) return;

        const newPreviews = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            filename: file.name,
        }));

        setData(
            'photos',
            [
                ...data.photos,
                ...files,
            ]
        );

        setPreviewPhotos((previous) => [
            ...previous,
            ...newPreviews,
        ]);

        event.target.value = '';
    };

    const handleRemovePhoto = (
        previewId,
        fileToRemove
    ) => {
        const photoToRemove =
            previewPhotos.find(
                (photo) =>
                    photo.id === previewId
            );

        if (photoToRemove) {
            URL.revokeObjectURL(
                photoToRemove.preview
            );
        }

        setPreviewPhotos((previous) =>
            previous.filter(
                (photo) =>
                    photo.id !== previewId
            )
        );

        setData(
            'photos',
            data.photos.filter(
                (file) =>
                    file !== fileToRemove
            )
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
                    {t('common.cancel')}
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

                    <Button
                        unstyled
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
                    </Button>
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
                    {t('album.create_meta_title')}
                </h1>

                <p
                    className="
                        mt-2 max-w-2xl
                        font-body text-body
                        text-gray-50
                    "
                >
                    Dokumentasikan perjalanan dan momen
                    berkesanmu dalam sebuah album untuk
                    disimpan atau dibagikan kepada Nuravers
                    lainnya.
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

                    {/* Title */}
                    <div className="mb-5">
                        <Input
                            name="title"
                            label={t('album.field_title')}
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            placeholder={t('album.field_title_placeholder')}
                            error={errors.title}
                            required
                        />
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
                            {/* Dibungkus relative agar daftar saran di bawah
                                menempel pada kolomnya. */}
                            <div className="relative">
                                <Input
                                    name="location"
                                    label={t('album.field_location')}
                                    value={data.location}
                                    onChange={(e) => {
                                        setData((prev) => ({ ...prev, location: e.target.value, place_id: null }));
                                        setShowLocationDropdown(true);
                                    }}
                                    onFocus={() => setShowLocationDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                    placeholder={t('album.field_location_placeholder')}
                                    icon={<FiSearch size={18} />}
                                    error={errors.location}
                                    required
                                />

                                {/* Dropdown Suggestions */}
                                {showLocationDropdown && locationSuggestions.length > 0 && (
                                    <div className="
                                        absolute z-20 w-full mt-2
                                        bg-white rounded-2xl
                                        border border-gray-30 shadow-lg
                                        overflow-hidden
                                    ">
                                        {locationSuggestions.map((place) => (
                                            <Button
                                                unstyled
                                                key={place.id}
                                                onClick={() => {
                                                    setData((prev) => ({ ...prev, location: place.name, place_id: place.id }));
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
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <Input
                                name="date"
                                type="date"
                                label={t('album.field_date')}
                                max={maxDate}
                                value={data.date}
                                onChange={(event) =>
                                    setData('date', event.target.value)
                                }
                                error={errors.date}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* ====================================================
                    PHOTOS
                ==================================================== */}
                <div className="mb-8">
                    {/* Photo Header */}
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
                                {t('album.field_photos')}
                            </h2>

                            <p
                                className="
                                    mt-1
                                    font-body text-micro
                                    text-gray-50
                                "
                            >
                                Pilih satu atau beberapa foto
                                perjalanan untuk dimasukkan ke
                                dalam album.
                            </p>
                        </div>

                        <Button
                            variant="secondary"
                            size="btn-sm"
                            iconLeft={
                                <FiPlus size={15} />
                            }
                            onClick={handleAddPhotos}
                        >
                            Pilih Foto
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

                    {/* Photo Previews */}
                    {previewPhotos.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {previewPhotos.map((photo) => (
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
                                            src={photo.preview}
                                            alt={photo.filename}
                                            className="
                                                h-full w-full
                                                object-cover
                                            "
                                        />
                                    </div>

                                    {/* File Information */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="
                                                truncate
                                                font-body text-small
                                                font-medium
                                                text-gray-85
                                            "
                                        >
                                            {photo.filename}
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                font-body text-micro
                                                text-gray-50
                                            "
                                        >
                                            {(
                                                photo.file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{' '}
                                            MB
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <Button
                                        unstyled
                                        onClick={() =>
                                            handleRemovePhoto(
                                                photo.id,
                                                photo.file
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
                                        title={t('album.cancel_upload')}
                                        aria-label={`${t('album.cancel_upload')} ${photo.filename}`}
                                    >
                                        <FiX size={17} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Button
                            unstyled
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
                                Belum ada foto yang dipilih
                            </p>

                            <p
                                className="
                                    mt-1
                                    font-body text-micro
                                    text-gray-50
                                "
                            >
                                Klik untuk memilih foto
                                perjalananmu.
                            </p>
                        </Button>
                    )}
                </div>

                {/* ====================================================
                    SUBMIT
                ==================================================== */}
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
                        {t('album.create_submit')}
                    </Button>
                </div>
            </form>
        </section>
    );
}

// ============================================================
// LAYOUT
// ============================================================
AlbumCreate.layout = (page) => (
    <MainLayout
        pageTitle="title.album_create"
        pageDescription="Buat album perjalanan baru di NuraLoka untuk mendokumentasikan destinasi, momen, dan pengalaman wisata berkesanmu serta membagikannya kepada komunitas Nuravers."
        content={page}
    />
);
