import { useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import Button from '@components/Forms/Button';

import {
    FiChevronLeft,
    FiPlus,
    FiX,
} from 'react-icons/fi';

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumEdit({
    album,
    photos: initialPhotos = [],
}) {
    const [photos, setPhotos] = useState(initialPhotos);
    const fileInputRef = useRef(null);

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
            route('album.show', album.id)
        );
    };

    const handleToggleVisibility = () => {
        router.post(
            route(
                'album.toggle.visibility',
                album.id
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

        put(
            route(
                'album.update',
                album.id
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
                album.id
            ),
            formData,
            {
                preserveScroll: true,
                forceFormData: true,
            }
        );

        event.target.value = '';
    };

    const handleRemovePhoto = (photoId) => {
        const isConfirmed = window.confirm(
            'Yakin ingin menghapus foto ini?'
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
                    Kembali
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

                                ${
                                    data.is_public
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

                                    ${
                                        data.is_public
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
                            {data.is_public
                                ? 'Publik'
                                : 'Privat'}
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
                    Edit Album
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
                            Judul Album

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
                            required
                            placeholder="Masukkan judul album..."
                            className="
                                w-full
                                rounded-lg
                                border border-gray-30
                                bg-white
                                px-4 py-2.5
                                font-body text-small
                                text-gray-85
                                outline-none
                                transition-all

                                placeholder:text-gray-30

                                focus:border-primary-85
                                focus:ring-2
                                focus:ring-primary-30
                            "
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
                                Lokasi

                                <span className="ml-1 text-error-dark">
                                    *
                                </span>
                            </label>

                            <input
                                id="location"
                                type="text"
                                value={data.location}
                                onChange={(event) =>
                                    setData(
                                        'location',
                                        event.target.value
                                    )
                                }
                                required
                                placeholder="Contoh: Yogyakarta..."
                                className="
                                    w-full
                                    rounded-lg
                                    border border-gray-30
                                    bg-white
                                    px-4 py-2.5
                                    font-body text-small
                                    text-gray-85
                                    outline-none
                                    transition-all

                                    placeholder:text-gray-30

                                    focus:border-primary-85
                                    focus:ring-2
                                    focus:ring-primary-30
                                "
                            />

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
                                Tanggal

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
                                required
                                className="
                                    w-full
                                    rounded-lg
                                    border border-gray-30
                                    bg-white
                                    px-4 py-2.5
                                    font-body text-small
                                    text-gray-85
                                    outline-none
                                    transition-all

                                    focus:border-primary-85
                                    focus:ring-2
                                    focus:ring-primary-30
                                "
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
                                Daftar Foto
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
                                                    '/images/defaults/avatar.png';
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
                                        title="Hapus foto"
                                        aria-label={`Hapus ${
                                            photo.filename ||
                                            'foto'
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
                        Simpan Perubahan
                    </Button>
                </div>
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
