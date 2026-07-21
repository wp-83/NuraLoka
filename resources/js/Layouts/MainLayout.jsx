import Flash from '@components/Common/Flash';
import Footer from '@components/Layouts/User/Footer';
import Navbar from '@components/Layouts/User/Navbar';
import { FlashContext } from '@js/Contexts/FlashContext';
import { useTranslation } from '@js/i18n';

import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function MainLayout({
    pageTitle = '',
    content,
    pageDescription = '',
    pageImage = '',
    pageUrl = '',
}) {
    const { flash } = usePage().props;
    const { t } = useTranslation();

    const [currentFlash, setCurrentFlash] = useState({
        type: flash?.type ?? null,
        message: flash?.message ?? null,
        id: flash?.type && flash?.message ? Date.now() : 0,
    });

    /*
    |--------------------------------------------------------------------------
    | Sync Flash dari Inertia
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.type && flash?.message) {
            setCurrentFlash({
                type: flash.type,
                message: flash.message,
                id: Date.now(),
            });
        }
    }, [flash?.type, flash?.message]);

    /*
    |--------------------------------------------------------------------------
    | Show Flash (client-side, dipakai halaman via FlashContext)
    |--------------------------------------------------------------------------
    */

    const showFlash = useCallback((type, message) => {
        // id memaksa remount Flash agar animasi berjalan ulang tiap dipanggil.
        setCurrentFlash({ type, message, id: Date.now() });
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Clear Flash
    |--------------------------------------------------------------------------
    */

    const clearFlash = () => {
        setCurrentFlash({ type: null, message: null, id: 0 });

        if (flash) {
            flash.type = null;
            flash.message = null;
        }
    };

    // pageTitle boleh berupa kunci terjemahan ("album.meta_title") maupun teks
    // biasa. translate() mengembalikan kuncinya apa adanya bila tidak ditemukan,
    // jadi halaman yang masih memakai teks langsung tetap tampil seperti semula.
    const resolvedTitle = pageTitle ? t(pageTitle) : '';

    const title =
        `NuraLoka${resolvedTitle ? ` | ${resolvedTitle}` : ''}`;

    const description =
        pageDescription ||
        'NuraLoka membantu kamu menemukan destinasi wisata, kuliner, dan pengalaman perjalanan terbaik di Indonesia.';

    const image =
        pageImage ||
        '/images/logo/with-tagline.jpg';

    const canonicalUrl =
        pageUrl ||
        (
            typeof window !== 'undefined'
                ? window.location.href
                : ''
        );

    const keywords =
        'wisata, destinasi, kuliner, perjalanan, Indonesia, tempat menarik, hidden gem, NuraLoka';

    return (
        <>
            <Head>
                <title>{title}</title>

                <meta
                    name="description"
                    content={description}
                />

                <meta
                    name="keywords"
                    content={keywords}
                />

                <meta
                    name="robots"
                    content="index, follow"
                />

                <meta
                    property="og:title"
                    content={title}
                />

                <meta
                    property="og:description"
                    content={description}
                />

                <meta
                    property="og:type"
                    content="website"
                />

                {canonicalUrl && (
                    <meta
                        property="og:url"
                        content={canonicalUrl}
                    />
                )}

                <meta
                    property="og:image"
                    content={image}
                />

                <meta
                    property="og:site_name"
                    content="NuraLoka"
                />

                {canonicalUrl && (
                    <link
                        rel="canonical"
                        href={canonicalUrl}
                    />
                )}
            </Head>

            <FlashContext.Provider value={showFlash}>
                <Navbar />

                <main className='container min-h-80'>
                    {content}
                </main>

                <Footer />

                {/* Flash terpusat: dipakai pesan server (Inertia) & client (via showFlash).
                    Dirender di root layout agar tampil di atas Navbar. */}
                {currentFlash.type && currentFlash.message && (
                    <Flash
                        key={currentFlash.id}
                        type={currentFlash.type}
                        message={currentFlash.message}
                        onClose={clearFlash}
                    />
                )}
            </FlashContext.Provider>
        </>
    );
}
