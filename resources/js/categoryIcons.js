/**
 * Ikon kategori — SATU sumber untuk kartu tempat, halaman detail, dan pin peta.
 *
 * Urutan yang dipakai:
 *   1. gambar yang diunggah admin (categories.icon_path);
 *   2. emoji bawaan sesuai nama kategori;
 *   3. 📍 sebagai jaring pengaman.
 *
 * Emoji dipilih agar tidak butuh aset tambahan — berguna karena sebagian besar
 * kategori memang belum punya gambar yang diunggah.
 */

import { mediaUrl } from '@js/mediaUrl';

export const CATEGORY_EMOJI = {
    'Wisata Alam': '🌿',
    'Wisata Budaya': '🏛️',
    'Wisata Sejarah': '🏯',
    'Wisata Gunung': '⛰️',
    'Wisata Edukasi': '📚',
    Kuliner: '🍽️',
    'Wisata Kuliner': '🍽️',
    Museum: '🏛️',
    'Taman Hiburan': '🎡',
    Belanja: '🛍️',
    Religi: '🕌',
    'Wisata Religi': '🕌',
    'Hidden Gem': '💎',
    Pantai: '🏖️',
    'Wisata Pantai': '🏖️',
    'Air Terjun': '💧',
};

export const CATEGORY_EMOJI_FALLBACK = '📍';

/** Emoji untuk sebuah nama kategori. */
export function categoryEmoji(name) {
    return CATEGORY_EMOJI[name] ?? CATEGORY_EMOJI_FALLBACK;
}

/**
 * URL gambar kategori bila ada, atau null.
 *
 * Ikon baru diunggah ke storage disk (mis. "category-icons/xxx.webp"),
 * sedangkan data lama berupa path publik ("/images/categories/xxx.webp").
 * mediaUrl() menangani keduanya agar data lama tidak rusak.
 */
export function categoryIconUrl(category) {
    return mediaUrl(category?.icon_path);
}
