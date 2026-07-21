import { readCache, writeCache } from './cache';
import { detectRegion } from './detector';

/**
 * Penyimpan hasil deteksi wilayah di level modul (bukan React context).
 *
 * Dipilih agar deteksi berjalan SEKALI per pemuatan halaman meski ada banyak
 * sapaan di layar, tanpa perlu membungkus <App> Inertia — membungkusnya akan
 * memutus usePage() dan memaksa kita meniru sendiri resolusi layout Inertia.
 */

let state = {
    payload: null,
    isDetecting: false,
};

const listeners = new Set();

function emit(next) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

export function getSnapshot() {
    return state;
}

// Snapshot untuk SSR / render pertama di server: tidak ada hasil deteksi klien.
const serverSnapshot = { payload: null, isDetecting: false };

export function getServerSnapshot() {
    return serverSnapshot;
}

/**
 * Sumber payload server yang sudah final sehingga deteksi di klien tidak perlu
 * dijalankan — dan tidak boleh menimpanya.
 *
 *   user_profile — provinsi tersimpan milik user;
 *   forced       — DAERAH_FORCE_PROVINCE di .env atau ?daerah= di URL.
 */
export function isAuthoritative(payload) {
    return payload?.source === 'user_profile' || payload?.source === 'forced';
}

let detectionStarted = false;

/**
 * Jalankan rantai deteksi bila memang diperlukan.
 *
 * Dilewati bila server sudah memakai provinsi profil user (sumber paling
 * tepercaya) atau bila cache deteksi sebelumnya masih berlaku — inilah yang
 * mencegah dialog izin lokasi muncul berulang kali.
 */
export function ensureDetection(serverPayload) {
    if (detectionStarted) return;
    if (typeof window === 'undefined') return;

    // Sudah final dari server — jangan jalankan deteksi yang malah menimpanya.
    if (isAuthoritative(serverPayload)) {
        detectionStarted = true;
        return;
    }

    const cached = readCache();

    if (cached?.phrases) {
        detectionStarted = true;
        emit({ payload: cached });

        return;
    }

    detectionStarted = true;
    emit({ isDetecting: true });

    detectRegion()
        .then((detected) => {
            if (detected?.phrases) {
                writeCache(detected);
                emit({ payload: detected });
            }
        })
        .finally(() => emit({ isDetecting: false }));
}

/** Paksa deteksi ulang — mis. setelah user mengubah provinsi di profil. */
export function resetDetection() {
    detectionStarted = false;
    emit({ payload: null, isDetecting: false });
}
