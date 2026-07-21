/**
 * Cache hasil deteksi wilayah di localStorage.
 *
 * Tujuannya menghindari permintaan izin lokasi berulang setiap pindah halaman.
 * Cache hanya disegarkan bila lokasi yang terdeteksi BERUBAH provinsi — selama
 * provinsinya sama, payload lama dipakai terus.
 */

const STORAGE_KEY = 'nuraloka.daerah';

// Naikkan versi bila bentuk payload berubah, supaya cache lama diabaikan
// (bukan dibaca sebagai data yang salah bentuk).
const VERSION = 1;

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function isStorageAvailable() {
    try {
        return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
        // Safari mode privat melempar saat localStorage diakses.
        return false;
    }
}

export function readCache() {
    if (!isStorageAvailable()) return null;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const entry = JSON.parse(raw);

        if (entry?.version !== VERSION) return null;
        if (!entry?.payload?.phrases) return null;
        if (Date.now() - (entry.savedAt ?? 0) > MAX_AGE_MS) return null;

        return entry.payload;
    } catch {
        return null;
    }
}

export function writeCache(payload) {
    if (!isStorageAvailable() || !payload?.phrases) return;

    try {
        const current = readCache();

        // Lokasi tidak berubah → tidak perlu menulis ulang.
        if (current && current.province === payload.province) return;

        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                version: VERSION,
                savedAt: Date.now(),
                payload,
            }),
        );
    } catch {
        // Kuota penuh / storage diblokir — fitur ini opsional, abaikan saja.
    }
}

export function clearCache() {
    if (!isStorageAvailable()) return;

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Abaikan.
    }
}
