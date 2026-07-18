import { usePage } from '@inertiajs/react';

/**
 * Terjemahkan satu key bertitik (mis. "nav.home") dari objek translations yang di-share
 * server. Bila key tak ditemukan, kembalikan key apa adanya (aman & memudahkan debug).
 * Mendukung placeholder gaya Laravel: t('common.hello', { name: 'Andi' }) → ":name" diganti.
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
 * Ambil nilai terjemahan MENTAH (bisa array/objek, mis. daftar slide) dari key bertitik.
 * Berbeda dari translate() yang selalu memaksa string; ini mengembalikan nilai apa adanya,
 * atau `fallback` bila tidak ditemukan.
 */
export function translateRaw(translations, key, fallback = null) {
    const value = String(key)
        .split('.')
        .reduce((obj, part) => (obj && typeof obj === 'object' ? obj[part] : undefined), translations);

    return value === undefined ? fallback : value;
}

/**
 * Hook terjemahan untuk komponen. Membaca translations & locale dari props Inertia
 * (di-share via HandleInertiaRequests).
 * Pemakaian: const { t, tRaw, locale } = useTranslation().
 *   - t(key, repl)  → string (fallback ke key)
 *   - tRaw(key, fb) → nilai mentah (array/objek), fallback fb
 */
export function useTranslation() {
    const { translations = {}, locale = 'id' } = usePage().props;
    const t = (key, replacements) => translate(translations, key, replacements);
    const tRaw = (key, fallback = null) => translateRaw(translations, key, fallback);

    return { t, tRaw, locale, translations };
}
