import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@components/Layouts/User/Navbar';
import Footer from '@components/Layouts/User/Footer';
import PlaceCard from '@components/Features/PlaceCard';
import Button from '@components/Forms/Button';
import { FiBookmark } from 'react-icons/fi';

export default function WishlistIndex({ savedPlaces = [], savedPlaceIds = [], saveCounts = {} }) {
    const { auth } = usePage().props;

    const handleVisit = (place) => {
        if (place && place.slug) {
            router.visit(route('wishlist.show', place.slug));
        }
    };

    const handleToggleSave = (place) => {
        router.post(route('wishlist.toggle'), {
            place_id: place.id,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="NuraLoka | Impian">
                <meta name="description" content="Daftar impian destinasi wisata yang kamu simpan di NuraLoka." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans">
                <Navbar />

                {/* Hero Header */}
                <section className="relative w-full overflow-hidden">
                    {/* Background ornament */}
                    <div className="absolute top-0 right-0 w-72 h-72 opacity-10 pointer-events-none">
                        <img
                            src="/images/mascots/camera.png"
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-10 pb-6 relative z-10">
                        <div className="grid grid-cols-12 gap-5">
                            <div className="col-start-2 col-end-12">
                                <h1
                                    className="text-title md:text-hero font-extrabold text-primary-100 mb-2 drop-shadow-sm font-heading italic"
                                >
                                    Impian dari Nuravers
                                </h1>
                                <p className="text-body text-primary-70 font-medium mb-6 font-heading italic">
                                    Impianmu Nuravers
                                </p>

                                {savedPlaces.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-32 h-32 opacity-50">
                                            <img
                                                src="/images/mascots/wait.png"
                                                alt="mascot"
                                                className="w-full h-full object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                        <p className="text-gray-50 text-paragraph font-medium text-center">
                                            Belum ada destinasi impianmu.<br />
                                            <span className="text-body text-gray-30">Ayo jelajahi dan simpan destinasi favoritmu!</span>
                                        </p>
                                        <Button
                                            onClick={() => router.visit(route('explore.index'))}
                                            variant="primary"
                                            className="mt-2"
                                        >
                                            Ayo cari lagi destinasi impianmu!
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-end mb-6">
                                            <Button
                                                onClick={() => router.visit(route('explore.index'))}
                                                variant="primary"
                                            >
                                                Ayo cari lagi destinasi impianmu!
                                            </Button>
                                        </div>

                                        {/* Grid of saved places */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                            {savedPlaces.map((place) => (
                                                <PlaceCard
                                                    key={place.id}
                                                    place={place}
                                                    onVisit={handleVisit}
                                                    isSaved={savedPlaceIds.includes(place.id)}
                                                    onToggleSave={handleToggleSave}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex-grow" />

                <Footer />
            </div>
        </>
    );
}
