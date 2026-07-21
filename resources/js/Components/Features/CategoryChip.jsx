import { useState } from 'react';

import { categoryEmoji, categoryIconUrl } from '@js/categoryIcons';

/**
 * Label kategori beserta ikonnya.
 *
 * Ikon mengikuti gambar yang diunggah admin bila kategori itu punya; kalau belum
 * ada, dipakai emoji khas kategorinya. Dipakai bersama oleh kartu tempat dan
 * halaman detail supaya kategori yang sama tidak tampil berbeda di dua tempat.
 *
 * Sebelumnya halaman detail memasang satu ikon taman untuk SEMUA kategori, dan
 * kartu tempat tidak menampilkan ikon sama sekali.
 */
export default function CategoryChip({ category, size = 'md' }) {
    // Gambar bisa saja terhapus dari public/; jangan sampai muncul ikon rusak.
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
