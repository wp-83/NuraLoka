import { router } from '@inertiajs/react';

import MainLayout from '@js/Layouts/MainLayout';
import EmptyState from '@components/Common/EmptyState';
import Button from '@components/Forms/Button';
import AlbumCard from '@components/Features/AlbumCard';
import { useTranslation } from '@js/i18n';

import { FiChevronLeft } from 'react-icons/fi';

// ============================================================
// MAIN PAGE
// ============================================================
export default function AlbumAll({
    albums = [],
    pageTitle = 'Semua Album Kamu',
    ownerName = null,
}) {
    const { t } = useTranslation();
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
                    {t('common.back')}
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
                        <AlbumCard
                            key={album.id}
                            album={album}
                            showVisibility
                        />
                    ))}
                </div>
            ) : (
                <div
                    className="
                        rounded-3xl
                        border border-gray-10
                        bg-white px-6
                        shadow-sm
                    "
                >
                    <EmptyState
                        title={
                            ownerName
                                ? t('album.all_empty_owner', { name: ownerName })
                                : t('album.all_empty')
                        }
                    />
                </div>
            )}
        </section>
    );
}

// ============================================================
// LAYOUT
// ============================================================
AlbumAll.layout = (page) => (
    <MainLayout
        pageTitle="title.album_all"
        pageDescription="Jelajahi koleksi album perjalanan dan temukan berbagai cerita serta pengalaman wisata bersama komunitas Nuravers di NuraLoka."
        content={page}
    />
);
