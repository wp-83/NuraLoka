import { Link, Head } from '@inertiajs/react';
import '@css/News/Show.css';

export default function Show({ newsItem }) {
    // Determine the author's display name safely
    const authorName = newsItem.user?.userDetails?.fullname
        || newsItem.user?.user_details?.fullname
        || newsItem.user?.username
        || 'Admin NuraLoka';

    // Format absolute date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB';
    };

    // Parse the content text into paragraphs
    const renderContent = (content) => {
        if (!content) return null;
        // Split by double newline to separate paragraphs
        return content.split(/\n+/).map((paragraph, index) => (
            <p key={index} className="news-paragraph">
                {paragraph.trim()}
            </p>
        ));
    };

    return (
        <>
            <Head>
                <title>{`NuraLoka | ${newsItem.title}`}</title>
                <meta name="description" content={newsItem.content ? newsItem.content.substring(0, 160) : ''} />
            </Head>

            <article className="news-detail-container">
                {/* Back Button */}
                <div className="back-navigation">
                    <Link href={route('news.index')} className="back-link">
                        &larr; Kembali ke Semua Wawasan Wisata
                    </Link>
                </div>

                {/* News Article Header */}
                <header className="news-detail-header">
                    <h1 className="news-detail-title">{newsItem.title}</h1>
                    <div className="news-detail-meta">
                        <div className="meta-author">
                            <span className="meta-label">Penulis:</span>
                            <span className="meta-value">{authorName}</span>
                        </div>
                        <div className="meta-divider">|</div>
                        <div className="meta-date">
                            <span className="meta-label">Diterbitkan:</span>
                            <span className="meta-value">{formatDate(newsItem.publish_date)}</span>
                        </div>
                    </div>
                </header>

                {/* Main Article Image Banner */}
                <div className="news-detail-image-wrapper">
                    <img
                        src={newsItem.thumbnail || '/images/defaults/image.png'}
                        alt={newsItem.title}
                        className="news-detail-image"
                    />
                </div>

                {/* Article Body Content */}
                <div className="news-detail-content">
                    {renderContent(newsItem.content)}
                </div>

                {/* Footer Back Link */}
                <footer className="news-detail-footer">
                    <Link href={route('news.index')} className="btn-primary back-btn-bottom">
                        Kembali ke Wawasan Wisata
                    </Link>
                </footer>
            </article>
        </>
    );
}
