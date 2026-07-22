/**
 * Category icons — ONE source for place cards, detail pages and map pins.
 *
 * The order used is:
 *   1. the image an admin uploaded (categories.icon_path);
 *   2. a built-in emoji matching the category name;
 *   3. 📍 as the safety net.
 *
 * Emoji were chosen because they need no extra assets, which matters while most
 * categories still have no uploaded image.
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

/** The emoji for a category name. */
export function categoryEmoji(name) {
    return CATEGORY_EMOJI[name] ?? CATEGORY_EMOJI_FALLBACK;
}

/**
 * The category's image URL, or null when it has none.
 *
 * New icons are uploaded to the storage disk (e.g. "category-icons/xxx.webp"),
 * while older rows hold a public path ("/images/categories/xxx.webp").
 * mediaUrl() handles both so the old data keeps working.
 */
export function categoryIconUrl(category) {
    return mediaUrl(category?.icon_path);
}
