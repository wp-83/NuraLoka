import { router } from '@inertiajs/react';

import PlaceCard from '@components/Features/PlaceCard';
import Button from '@components/Forms/Button';
import MainLayout from '@js/Layouts/MainLayout';

export default function Index({
    savedPlaces = [],
    savedPlaceIds = [],
}) {
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
        <section className="container relative w-full overflow-hidden">
            {/* Background Ornament */}
            <div
                className="
                    pointer-events-none
                    absolute right-0 top-0
                    h-72 w-72
                    opacity-10
                "
            >
                <img
                    src="/images/mascots/camera.png"
                    alt=""
                    className="h-full w-full object-contain"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="
                            mb-2
                            font-heading text-title
                            font-extrabold italic
                            text-primary-100
                            drop-shadow-sm

                            md:text-hero
                        "
                    >
                        Impian dari Nuravers
                    </h1>

                    <p
                        className="
                            font-heading text-body
                            font-medium italic
                            text-primary-70
                        "
                    >
                        Impianmu Nuravers
                    </p>
                </div>

                {/* Empty State */}
                {!hasSavedPlaces ? (
                    <div
                        className="
                            flex flex-col
                            items-center justify-center
                            gap-4 py-20
                        "
                    >
                        <img
                            src="/images/mascots/wait.png"
                            alt="NuraLoka Mascot"
                            className="
                                h-32 w-32
                                object-contain
                                opacity-50
                            "
                        />

                        <p
                            className="
                                text-center
                                font-body text-paragraph
                                font-medium text-gray-50
                            "
                        >
                            Belum ada destinasi impianmu.

                            <span
                                className="
                                    mt-1 block
                                    text-body text-gray-30
                                "
                            >
                                Ayo jelajahi dan simpan destinasi favoritmu!
                            </span>
                        </p>

                        <Button
                            onClick={handleExplore}
                            variant="primary"
                            className="mt-2"
                        >
                            Ayo cari lagi destinasi impianmu!
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Action */}
                        <div className="mb-6 flex justify-end">
                            <Button
                                onClick={handleExplore}
                                variant="primary"
                            >
                                Ayo cari lagi destinasi impianmu!
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
        pageTitle="Impian"
        pageDescription="Lihat dan kelola daftar destinasi wisata impian yang telah kamu simpan di NuraLoka. Temukan kembali tempat favoritmu dan rencanakan perjalanan berikutnya dengan lebih mudah."
        content={page}
    />
);
