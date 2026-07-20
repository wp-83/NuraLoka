import Button from '@components/Forms/Button';

import { router } from '@inertiajs/react';
import { useTranslation } from '@js/i18n';

import {
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';

export default function Pagination({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    itemLabel = 'data',
}) {
    const { t } = useTranslation();

    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t border-gray-20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-small text-gray-50">
                {t('admin.common.showing', {
                    from: from ?? 0,
                    to: to ?? 0,
                    all: total ?? 0,
                    label: itemLabel,
                })}
            </p>

            <div className="flex items-center gap-2">
                {links.map((link, index) => {
                    const isPrevious = index === 0;
                    const isNext =
                        index === links.length - 1;

                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            type="button"
                            variant={
                                link.active
                                    ? 'primary'
                                    : 'white'
                            }
                            size="btn-sm"
                            disabled={!link.url}
                            className="h-9 min-w-9 px-3"
                            onClick={() => {
                                if (link.url) {
                                    router.get(
                                        link.url,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }
                            }}
                        >
                            {isPrevious ? (
                                <FiChevronLeft size={18} />
                            ) : isNext ? (
                                <FiChevronRight size={18} />
                            ) : (
                                link.label
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
