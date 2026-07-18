import { Link, Head, usePage } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';
import '@css/News/Index.css';

const LOCALE_TAG = { id: 'id-ID', en: 'en-US', ko: 'ko-KR' };

export default function Index({ news }) {
    const { auth } = usePage().props;
    const { t, locale } = useTranslation();
    // Waktu relatif mengikuti bahasa aktif (baru saja / menit / jam / hari yang lalu).
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return t('news.just_now');
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return t('news.minutes_ago', { count: diffInMinutes });
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return t('news.hours_ago', { count: diffInHours });
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return t('news.days_ago', { count: diffInDays });
        }

        return date.toLocaleDateString(LOCALE_TAG[locale] || 'id-ID', {
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
                <title>{`NuraLoka | ${t('news.meta_title')}`}</title>
                <meta name="description" content={t('news.meta_description')} />
            </Head>

            <div className="news-index-container">
                {/* Back button */}
                <div className="back-navigation">
                    <Link href={route('home.index')} className="back-to-home-link">
                        &larr; {t('news.back_to_home')}
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
                        <h1 className="news-index-title">{t('news.index_title')}</h1>
                        <p className="news-index-subtitle">
                            {t('news.index_subtitle')}
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
                                            {t('news.read_more')}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="news-grid-empty">
                            <p>{t('news.empty')}</p>
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
                                label = t('common.previous');
                            } else if (label.includes('Next')) {
                                label = t('common.next');
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
