import { router } from '@inertiajs/react';

import EmptyState from '@components/Common/EmptyState';
import PlaceCard from '@components/Features/PlaceCard';
import Button from '@components/Forms/Button';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import { useTranslation } from '@js/i18n';

export default function Index({
    savedPlaces = [],
    savedPlaceIds = [],
}) {
    const { t } = useTranslation();
    const hasSavedPlaces = savedPlaces.length > 0;

    const handleVisit = (place) => {
        if (!place?.slug) return;

        router.visit(
            route('wishlist.show', place.slug)
        );
    };

    const handleToggleSave = (place) => {
        if (!place?.id) return;

        router.post(
            route('wishlist.toggle'),
            {
                place_id: place.id,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleExplore = () => {
        router.visit(route('explore.index'));
    };

    return (
        <section className="relative overflow-hidden">
            {/* Content */}
            <div className="relative z-10 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="
                            font-heading text-title
                            font-bold
                            text-primary-100
                            sm:text-hero
                        "
                    >
                        {t('wishlist.title')}
                    </h1>

                    <RegionalGreeting
                        phrase="wishlist_index"
                        className="text-paragraph mt-2 local-language"
                    />
                </div>

                {/* Empty State */}
                {!hasSavedPlaces ? (
                    <EmptyState
                        title={t('wishlist.empty_text')}
                        description={t('wishlist.empty_sub')}
                        action={
                            <Button
                                onClick={handleExplore}
                                variant="primary"
                            >
                                {t('wishlist.cta_explore')}
                            </Button>
                        }
                    />
                ) : (
                    <>
                        {/* Action */}
                        <div className="mb-6 flex justify-end">
                            <Button
                                onClick={handleExplore}
                                variant="primary"
                            >
                                {t('wishlist.cta_explore')}
                            </Button>
                        </div>

                        {/* Saved Places */}
                        <div
                            className="
                                mb-10 grid
                                grid-cols-1 gap-6

                                sm:grid-cols-2
                                lg:grid-cols-3
                            "
                        >
                            {savedPlaces.map((place) => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                    onVisit={handleVisit}
                                    isSaved={savedPlaceIds.includes(
                                        place.id
                                    )}
                                    onToggleSave={handleToggleSave}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

Index.layout = (page) => (
    <MainLayout
        pageTitle="title.wishlist"
        pageDescription="Lihat dan kelola daftar destinasi wisata impian yang telah kamu simpan di NuraLoka. Temukan kembali tempat favoritmu dan rencanakan perjalanan berikutnya dengan lebih mudah."
        content={page}
    />
);
