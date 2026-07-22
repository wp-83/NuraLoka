import { usePage } from '@inertiajs/react';

/**
 * Translate one dotted key (e.g. "nav.home") from the translations object shared
 * by the server. An unknown key is returned as-is, which is safe and makes the
 * gap obvious while debugging.
 *
 * Supports Laravel-style placeholders: t('common.hello', { name: 'Andi' })
 * replaces ":name".
 */
export function translate(translations, key, replacements = {}) {
    const value = String(key)
        .split('.')
        .reduce((obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined), translations);

    let str = typeof value === 'string' ? value : key;

    for (const [k, v] of Object.entries(replacements)) {
        str = str.replaceAll(`:${k}`, String(v));
    }

    return str;
}

/**
 * Read a RAW translation value (which may be an array or object, e.g. a list of
 * slides) from a dotted key.
 *
 * Unlike translate(), which always coerces to a string, this returns the value
 * untouched — or `fallback` when the key is missing.
 */
export function translateRaw(translations, key, fallback = null) {
    const value = String(key)
        .split('.')
        .reduce((obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined), translations);

    return value === undefined ? fallback : value;
}

/**
 * Translation hook for components. Reads translations and locale from the
 * Inertia props (shared by HandleInertiaRequests).
 *
 * Usage: const { t, tRaw, locale } = useTranslation().
 *   - t(key, repl)  → a string (falling back to the key itself)
 *   - tRaw(key, fb) → the raw value (array/object), falling back to fb
 */
export function useTranslation() {
    const { translations = {}, locale = 'id' } = usePage().props;
    const t = (key, replacements) => translate(translations, key, replacements);
    const tRaw = (key, fallback = null) => translateRaw(translations, key, fallback);

    return { t, tRaw, locale, translations };
}
