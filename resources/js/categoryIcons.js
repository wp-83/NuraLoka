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
 * icon_path disimpan sudah berupa path publik lengkap (mis.
 * "/images/categories/xxx.webp"), jadi dipakai apa adanya. Nilai lama yang
 * tanpa garis miring depan tetap ditangani agar data lama tidak rusak.
 */
export function categoryIconUrl(category) {
    const path = category?.icon_path;

    if (!path) return null;

    return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
}
