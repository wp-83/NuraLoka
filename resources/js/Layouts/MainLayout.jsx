import Flash from '@components/Common/Flash';
import Footer from '@components/Layouts/User/Footer';
import Navbar from '@components/Layouts/User/Navbar';

import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MainLayout({
    pageTitle = '',
    content,
    pageDescription = '',
    pageImage = '',
    pageUrl = '',
}) {
    const { flash } = usePage().props;

    const [currentFlash, setCurrentFlash] = useState(
        flash ?? {
            type: null,
            message: null,
        }
    );

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
            });
        }
    }, [flash?.type, flash?.message]);

    /*
    |--------------------------------------------------------------------------
    | Clear Flash
    |--------------------------------------------------------------------------
    */

    const clearFlash = () => {
        setCurrentFlash({
            type: null,
            message: null,
        });

        flash.type = null;
        flash.message = null;
    };

    const title =
        `NuraLoka${pageTitle ? ` | ${pageTitle}` : ''}`;

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

            <Navbar />

            <main className='container min-h-80'>
                {content}
            </main>

            <Footer />
        </>
    );
}
