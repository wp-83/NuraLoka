import { Head } from "@inertiajs/react";
import { useTranslation } from "@js/i18n";

export default function Error({ status }) {
    const { t } = useTranslation();
    const title = t(`error.titles.${status}`);
    const description = t(`error.descriptions.${status}`);

    return (
        <>
            <Head title={`${status} | ${title}`} />

            <div className="container flex h-screen flex-col items-center justify-center gap-0 md:flex-row md:gap-8">
                <img
                    src={`/images/errors/${status}.png`}
                    alt={status}
                    className="w-64 sm:w-72 md:w-80"
                />

                <div className="flex flex-col items-center gap-3 md:items-start">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <h1 className="text-hero font-bold text-primary-100">
                            {status}
                        </h1>

                        <h1 className="text-title text-secondary-85 hidden md:inline">|</h1>

                        <h2 className="text-subtitle text-center md:text-left font-heading text-primary-100">
                            {title}
                        </h2>
                    </div>

                    <p className="text-paragraph font-heading text-center md:text-left">
                        {description}
                    </p>
                </div>
            </div>
        </>
    );
}
