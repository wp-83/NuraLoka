import { Link } from '@inertiajs/react';

export default function NewsCard({
    news,
}) {
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
            return 'Baru saja';
        }

        const diffInMinutes =
            Math.floor(
                diffInSeconds / 60,
            );

        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        }

        const diffInHours =
            Math.floor(
                diffInMinutes / 60,
            );

        if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        }

        const diffInDays =
            Math.floor(
                diffInHours / 24,
            );

        if (diffInDays < 30) {
            return `${diffInDays} hari yang lalu`;
        }

        return date.toLocaleDateString(
            'id-ID',
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
        maxLength = 160,
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
                        news.thumbnail ||
                        '/images/defaults/image.png'
                    }
                    alt={news.title}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                {/* Title */}
                <h3 className="font-heading text-paragraph font-bold text-primary-100">
                    {news.title}
                </h3>

                {/* Publish Date */}
                <p className="mt-1 font-body text-small text-gray-50">
                    {getRelativeTime(
                        news.publish_date,
                    )}
                </p>

                {/* Excerpt */}
                <p className="mt-3 line-clamp-3 font-body text-body text-gray-70">
                    {getExcerpt(
                        news.content,
                    )}
                </p>

                {/* Action */}
                <div className="mt-auto pt-5">
                    <Link
                        href={route(
                            'news.show',
                            news.id,
                        )}
                        className="inline-flex rounded-lg bg-primary-100 px-3 py-2 font-body text-btn-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-70"
                    >
                        Baca Selengkapnya
                    </Link>
                </div>
            </div>
        </article>
    );
}
