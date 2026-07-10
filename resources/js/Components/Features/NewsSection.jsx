import { Link } from '@inertiajs/react';
import '@css/Components/NewsSection.css';

export default function NewsSection({ latestNews = [] }) {
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

    // Helper to truncate text to nice excerpt
    const getExcerpt = (text, maxLength = 160) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <section className="news-section-container">
            {/* Header Section */}
            <div className="news-header">
                <div className="news-header-left">
                    <img 
                        src="/images/mascots/hi.png" 
                        alt="Mascot Deer Waving" 
                        className="news-mascot"
                    />
                    <div className="news-title-wrapper">
                        <h2 className="news-heading">Wawasan Wisata Hari Ini</h2>
                        <p className="news-subheading">
                            Ayo membaca dan temukan wawasan baru seputar destinasi, budaya, serta tips perjalanan untuk petualangan Anda berikutnya.
                        </p>
                    </div>
                </div>
                <div className="news-header-right">
                    <Link href={route('news.index')} className="news-see-all-link">
                        Lihat Semua Wawasan Wisata &gt;
                    </Link>
                </div>
            </div>

            {/* News Cards List */}
            <div className="news-list">
                {latestNews.length > 0 ? (
                    latestNews.map((news) => (
                        <div key={news.id} className="news-card">
                            <div className="news-card-image-wrapper">
                                <img 
                                    src={news.thumbnail || '/images/defaults/image.png'} 
                                    alt={news.title} 
                                    className="news-card-thumbnail"
                                />
                            </div>
                            <div className="news-card-content">
                                <h3 className="news-card-title">{news.title}</h3>
                                <span className="news-card-date">{getRelativeTime(news.publish_date)}</span>
                                <p className="news-card-excerpt">{getExcerpt(news.content)}</p>
                                <div className="news-card-action">
                                    <Link href={route('news.show', news.id)} className="btn-primary btn-sm news-read-more-btn">
                                        Baca Selengkapnya
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="news-empty">
                        <p>Tidak ada wawasan wisata hari ini.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
