import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';
import { mediaUrl } from '@js/mediaUrl';
import Button from '@components/Forms/Button';
import { IoIosArrowBack } from 'react-icons/io';

const LOCALE_TAG = {
    id: 'id-ID',
    en: 'en-US',
    ko: 'ko-KR',
};

export default function Index({ news }) {
    const { auth } = usePage().props;
    const { t, locale } = useTranslation();

    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return t('news.just_now');
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);

        if (diffInMinutes < 60) {
            return t('news.minutes_ago', {
                count: diffInMinutes,
            });
        }

        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInHours < 24) {
            return t('news.hours_ago', {
                count: diffInHours,
            });
        }

        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays < 30) {
            return t('news.days_ago', {
                count: diffInDays,
            });
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

    const getExcerpt = (
        text,
        maxLength = 120,
    ) => {
        if (!text) return '';

        if (text.length <= maxLength) {
            return text;
        }

        return `${text.substring(0, maxLength)}...`;
    };

    return (
        <div className="pb-20 pt-8">
            {/* Back Navigation */}

            <div className="mb-6">
                <Link href={route('home.index')}>
                    <Button type="primary" iconLeft={<IoIosArrowBack />}>
                        {t('news.back_to_home')}
                    </Button>
                </Link>
            </div>

            {/* Header */}

            <section className="mb-12 flex flex-colpb-2 sm:flex-row sm:items-center">

                <img
                    src="/images/mascots/hi.png"
                    alt="NuraLoka Mascot"
                    className="h-32 shrink-0 object-contain sm:h-40"
                />

                <div className="space-y-1">

                    <h1 className="font-heading text-title font-extrabold text-primary-100">
                        {t('news.index_title')}
                    </h1>

                    <RegionalGreeting phrase="news_index" />

                </div>

            </section>

            {/* News Grid */}

            <section className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                {news.data && news.data.length > 0 ? (
                    news.data.map((item) => (
                        <article
                            key={item.id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-primary-30 bg-[#FCF7F4] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Thumbnail */}

                            <div className="relative h-52 w-full overflow-hidden">

                                <img
                                    src={
                                        mediaUrl(item.thumbnail) ||
                                        '/images/defaults/image.png'
                                    }
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                            </div>

                            {/* Content */}

                            <div className="flex flex-1 flex-col p-6">

                                <span className="mb-1 text-small italic text-gray-50">
                                    {getRelativeTime(
                                        item.publish_date,
                                    )}
                                </span>

                                <h2 className="mb-2 line-clamp-2 min-h-[3.4rem] font-heading text-paragraph font-bold leading-[1.35] text-primary-100">
                                    {item.title}
                                </h2>

                                <p className="mb-4 flex-1 text-justify text-body leading-relaxed text-gray-85 line-clamp-3">
                                    {getExcerpt(
                                        item.content,
                                    )}
                                </p>

                                <div className="flex justify-end">

                                    <Link
                                        href={route(
                                            'news.show',
                                            item.slug,
                                        )}
                                    >
                                        <Button type="primary">
                                            {t('news.read_more')}
                                        </Button>
                                    </Link>

                                </div>

                            </div>

                        </article>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-primary-30 bg-white px-8 py-16 text-center">

                        <p className="text-body text-gray-50">
                            {t('news.empty')}
                        </p>

                    </div>
                )}
            </section>

            {/* Pagination */}

            {news.links && news.links.length > 3 && (
                <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">

                    {news.links.map((link, index) => {
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
                                    className="cursor-not-allowed rounded-lg border border-gray-10 bg-white px-4 py-2 text-small font-semibold text-gray-30"
                                    dangerouslySetInnerHTML={{
                                        __html: label,
                                    }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                className={`rounded-lg border px-4 py-2 text-small font-semibold transition-all duration-200 ${
                                    link.active
                                        ? 'border-primary-100 bg-primary-100 text-white'
                                        : 'border-primary-30 bg-white text-primary-100 hover:border-primary-85 hover:bg-primary-10 hover:text-primary-85'
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: label,
                                }}
                            />
                        );
                    })}

                </nav>
            )}

        </div>
    );
}

Index.layout = (page) => (
    <MainLayout
        pageTitle="title.news"
        pageDescription="Temukan berita, cerita, dan informasi terbaru seputar NuraLoka."
        content={page}
    />
);
