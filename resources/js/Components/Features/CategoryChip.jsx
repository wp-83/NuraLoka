import { useState } from 'react';

import { categoryEmoji, categoryIconUrl } from '@js/categoryIcons';

/**
 * A category label with its icon.
 *
 * The icon is the image an admin uploaded when the category has one, and the
 * category's characteristic emoji when it does not. Shared by place cards and
 * detail pages so one category never looks different in two places.
 */
export default function CategoryChip({ category, size = 'md' }) {
    // The image may have been deleted from public/; never show a broken icon.
    const [imageFailed, setImageFailed] = useState(false);

    if (!category?.name) return null;

    const iconUrl = imageFailed ? null : categoryIconUrl(category);

    const sizes = {
        sm: {
            wrapper: 'gap-1 px-2.5 py-1.5 text-sm',
            icon: 'h-3.5 w-3.5',
        },
        md: {
            wrapper: 'gap-1.5 px-4 py-2 text-md',
            icon: 'h-6 w-6',
        },
    };

    const style = sizes[size] ?? sizes.md;

    return (
        <span
            className={`
                inline-flex items-center
                rounded-md bg-secondary
                font-body text-paragraph
                text-white

                ${style.wrapper}
            `}
        >
            {iconUrl ? (
                <img
                    src={iconUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    className={`shrink-0 object-contain ${style.icon}`}
                />
            ) : (
                <span aria-hidden="true" className="shrink-0 leading-none">
                    {categoryEmoji(category.name)}
                </span>
            )}

            {category.name}
        </span>
    );
}
