import { Link, Head, usePage } from '@inertiajs/react';
import '@css/News/Index.css';

export default function Index({ news }) {
    const { auth } = usePage().props;
    // Utility to generate relative time in Indonesian
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'baru saja';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} hari yang lalu`;
        }

        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper to truncate text
    const getExcerpt = (text, maxLength = 120) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <Head>
                <title>NuraLoka | Semua Wawasan Wisata</title>
                <meta name="description" content="Temukan seluruh wawasan wisata seputar destinasi, budaya, dan tips perjalanan di Indonesia." />
            </Head>

            <div className="news-index-container">
                {/* Back button */}
                <div className="back-navigation">
                    <Link href={route('/')} className="back-to-home-link">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>

                {/* Page Title & Mascot */}
                <div className="news-index-header">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="news-index-mascot"
                    />
                    <div className="news-index-title-wrapper">
                        <h1 className="news-index-title">Semua Wawasan Wisata</h1>
                        <p className="news-index-subtitle">
                            Jelajahi berbagai artikel menarik seputar keindahan destinasi, nilai budaya, serta tips perjalanan berharga dari NuraLoka.
                        </p>

                    </div>
                </div>

                {/* Grid of News Cards */}
                <div className="news-grid">
                    {news.data && news.data.length > 0 ? (
                        news.data.map((item) => (
                            <article key={item.id} className="news-grid-card">
                                <div className="news-grid-image-wrapper">
                                    <img
                                        src={item.thumbnail || '/images/defaults/image.png'}
                                        alt={item.title}
                                        className="news-grid-thumbnail"
                                    />
                                </div>
                                <div className="news-grid-content">
                                    <span className="news-grid-date">{getRelativeTime(item.publish_date)}</span>
                                    <h3 className="news-grid-title">{item.title}</h3>
                                    <p className="news-grid-excerpt">{getExcerpt(item.content)}</p>
                                    <div className="news-grid-action">
                                        <Link href={route('news.show', item.id)} className="btn-primary btn-sm news-read-more-btn">
                                            Baca Selengkapnya
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="news-grid-empty">
                            <p>Tidak ada wawasan wisata yang tersedia saat ini.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {news.links && news.links.length > 3 && (
                    <div className="news-pagination">
                        {news.links.map((link, index) => {
                            // Convert HTML entities like &laquo; and &raquo; to normal text
                            let label = link.label;
                            if (label.includes('Previous')) {
                                label = 'Sebelumnya';
                            } else if (label.includes('Next')) {
                                label = 'Selanjutnya';
                            }

                            if (!link.url) {
                                return (
                                    <span
                                        key={index}
                                        className="pagination-link pagination-disabled"
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`pagination-link ${link.active ? 'pagination-active' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
