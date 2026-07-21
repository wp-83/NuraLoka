import MainLayout from '@js/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';
import Button from '@components/Forms/Button';
import { IoIosArrowBack } from 'react-icons/io';

const LOCALE_TAG = {
    id: 'id-ID',
    en: 'en-US',
    ko: 'ko-KR',
};

export default function Show({ newsItem }) {
    console.log(newsItem);
    const { t, locale } = useTranslation();

    const authorName =
        newsItem.user?.userDetails?.fullname ||
        newsItem.user?.user_details?.fullname ||
        newsItem.user?.username ||
        t('news.default_author');

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return (
            date.toLocaleDateString(
                LOCALE_TAG[locale] || 'id-ID',
                {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                },
            ) +
            ' ' +
            t('news.time_suffix')
        );
    };

    const renderContent = (content) => {
        if (!content) return null;

        return content
            .split(/\n+/)
            .map((paragraph, index) => (
                <p
                    key={index}
                    className="mb-6 text-justify indent-8 leading-loose text-gray-85 max-sm:indent-4"
                >
                    {paragraph.trim()}
                </p>
            ));
    };

    return (
        <article className="mx-auto w-full max-w-4xl px-6 py-12">

            {/* Back */}

            <div className="mb-8">
                <Link href={route('news.index')}>
                    <Button iconLeft={<IoIosArrowBack />}>{t('news.show_back')}</Button>
                </Link>
            </div>

            {/* Header */}

            <header className="mb-8">

                <h1 className="mb-5 font-heading text-subtitle text-primary-100 sm:text-title">
                    {newsItem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 border-y border-primary-30 py-3 text-small text-primary-70 max-sm:flex-col max-sm:items-start max-sm:gap-2">

                    <div className="flex items-center gap-1">

                        <span className="text-primary-50">
                            {t('news.author_label')}
                        </span>

                        <span className="font-semibold">
                            {authorName}
                        </span>

                    </div>

                    <span className="text-primary-30 max-sm:hidden">
                        |
                    </span>

                    <div className="flex items-center gap-1">

                        <span className="text-primary-50">
                            {t('news.published_label')}
                        </span>

                        <span className="font-semibold">
                            {formatDate(
                                newsItem.publish_date,
                            )}
                        </span>

                    </div>

                </div>

            </header>

            {/* Hero Image */}

            <div className="mb-10 overflow-hidden rounded-2xl shadow-lg shadow-primary-100/10">

                <img
                    src={
                        newsItem.thumbnail ||
                        '/images/defaults/image.png'
                    }
                    alt={newsItem.title}
                    className="h-[250px] w-full object-cover sm:h-[350px] lg:h-[400px]"
                />

            </div>

            {/* Content */}

            <div className="mb-14 text-[1.15rem] leading-loose text-gray-85">

                {renderContent(
                    newsItem.content,
                )}

            </div>
        </article>
    );
}

Show.layout = (page) => (
    <MainLayout
        pageTitle="title.news_show"
        content={page}
    />
);
