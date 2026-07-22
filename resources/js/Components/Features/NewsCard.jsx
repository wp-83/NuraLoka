import { Link } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';
import { mediaUrl } from '@js/mediaUrl';
import Button from '@components/Forms/Button';

const LOCALE_TAG = { id: 'id-ID', en: 'en-US', ko: 'ko-KR' };

export default function NewsCard({
    news,
}) {
    const { t, locale } = useTranslation();

    /*
    |--------------------------------------------------------------------------
    | Relative Time
    |--------------------------------------------------------------------------
    */

    const getRelativeTime = (
        dateString,
    ) => {
        const now = new Date();
        const date = new Date(
            dateString,
        );

        const diffInSeconds =
            Math.floor(
                (now - date) / 1000,
            );

        if (diffInSeconds < 60) {
            return t('news.just_now');
        }

        const diffInMinutes =
            Math.floor(
                diffInSeconds / 60,
            );

        if (diffInMinutes < 60) {
            return t('news.minutes_ago', { count: diffInMinutes });
        }

        const diffInHours =
            Math.floor(
                diffInMinutes / 60,
            );

        if (diffInHours < 24) {
            return t('news.hours_ago', { count: diffInHours });
        }

        const diffInDays =
            Math.floor(
                diffInHours / 24,
            );

        if (diffInDays < 30) {
            return t('news.days_ago', { count: diffInDays });
        }

        return date.toLocaleDateString(
            LOCALE_TAG[locale] || 'id-ID',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Excerpt
    |--------------------------------------------------------------------------
    */

    const getExcerpt = (
        text,
        maxLength = 250,
    ) => {
        if (!text) {
            return '';
        }

        if (
            text.length <= maxLength
        ) {
            return text;
        }

        return `${text.substring(
            0,
            maxLength,
        )}...`;
    };

    if (!news) {
        return null;
    }

    return (
        <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm md:flex-row">
            {/* Thumbnail */}
            <div className="h-56 w-full shrink-0 md:h-auto md:w-72 lg:w-80">
                <img
                    src={
                        mediaUrl(news.thumbnail) ||
                        '/images/defaults/image.png'
                    }
                    alt={news.title}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                {/* Title */}
                <h3 className="font-heading text-paragraph text-primary-100">
                    {news.title}
                </h3>

                {/* Publish Date */}
                <p className="italic font-body text-small text-gray-50">
                    {getRelativeTime(
                        news.publish_date,
                    )}
                </p>

                {/* Excerpt */}
                <p className="mt-3 line-clamp-3 font-body text-body text-gray-100">
                    {getExcerpt(
                        news.content,
                    )}
                </p>

                {/* Action */}
                <div className="mt-auto pt-5">
                    <Link href={route('news.show', news.slug)}>
                        <Button
                            size="btn-sm"
                            type="button"
                        >
                            {t('news.read_more')}
                        </Button>
                    </Link>
                </div>
            </div>
        </article>
    );
}
