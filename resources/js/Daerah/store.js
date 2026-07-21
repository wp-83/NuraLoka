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
 * HANYA 'forced' (DAERAH_FORCE_PROVINCE di .env atau ?daerah= di URL), karena
 * itu memang alat untuk memaksa tampilan saat pengujian.
 *
 * 'user_profile' SENGAJA tidak lagi final: sapaan harus mengikuti lokasi user
 * SAAT INI lewat GPS, bukan provinsi yang tersimpan di profil. Provinsi profil
 * tetap dipakai sebagai cadangan bila GPS maupun IP sama-sama gagal.
 */
export function isAuthoritative(payload) {
    return payload?.source === 'forced';
}

let detectionStarted = false;

/**
 * Jalankan rantai deteksi bila memang diperlukan.
 *
 * Dilewati HANYA bila payload server dipaksa (forced), atau bila cache deteksi
 * sebelumnya masih berlaku — cache itulah yang mencegah dialog izin lokasi
 * muncul berulang kali saat pindah halaman.
 *
 * User yang sudah login pun tetap dideteksi: provinsi di profil bukan lagi
 * jawaban final, hanya cadangan terakhir.
 */
export function ensureDetection(serverPayload) {
    if (detectionStarted) return;
    if (typeof window === 'undefined') return;

    // Dipaksa untuk pengujian — jangan jalankan deteksi yang malah menimpanya.
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
