import { useTranslation } from '@js/i18n';

export default function EmptyState({
    title,
    description,
    image = '/images/mascots/wait.png',
}) {
    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-col items-center justify-center py-4 text-center">
            <img
                src={image}
                alt="Mascot"
                className="w-28"
            />

            <p className="mt-3 font-heading text-paragraph text-gray-100">
                {title ?? t('admin.common.empty_title')}
            </p>

            <p className="mt-1 font-body text-body text-gray-50">
                {description ?? t('admin.common.empty_description')}
            </p>
        </div>
    );
}
