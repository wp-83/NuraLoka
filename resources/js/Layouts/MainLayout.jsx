import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';
import { Head } from '@inertiajs/react';

export default function MainLayout({ pageTitle = "", content, pageDescription = '', pageImage = '', pageUrl = '' }) {
    const title = `NuraLoka${pageTitle ? ` | ${pageTitle}` : ''}`;
    const description = pageDescription || 'NuraLoka membantu kamu menemukan destinasi wisata, kuliner, dan pengalaman perjalanan terbaik di Indonesia.';
    const image = pageImage || '/images/og-default.jpg';
    const canonicalUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const keywords = 'wisata, destinasi, kuliner, perjalanan, Indonesia, tempat menarik, hidden gem, NuraLoka';

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
                <meta property="og:image" content={image} />
                <meta property="og:site_name" content="NuraLoka" />
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            </Head>

            <Navbar />

            <main className='container min-h-80'>
                {content}
            </main>

            <Footer />
        </>
    );
}
