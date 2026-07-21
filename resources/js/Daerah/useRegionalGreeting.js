import { useEffect, useSyncExternalStore } from 'react';
import { usePage } from '@inertiajs/react';

import {
    ensureDetection,
    getServerSnapshot,
    getSnapshot,
    isAuthoritative,
    subscribe,
} from './store';

/**
 * Hook sapaan bahasa daerah.
 *
 *   const { greeting } = useRegionalGreeting('home_hero');
 *   <p className="local-language">{greeting}</p>
 *
 * SENGAJA tidak memakai useTranslation(): sapaan daerah tidak boleh ikut berubah
 * saat pengguna mengganti bahasa aplikasi ke en/ko.
 *
 * Sumber payload, dari yang paling menang:
 *   1. forced       — DAERAH_FORCE_PROVINCE / ?daerah=, alat pengujian
 *   2. geolocation  — lokasi GPS user SAAT INI, sumber utama fitur ini
 *   3. ip           — perkiraan lokasi dari alamat IP
 *   4. user_profile — provinsi tersimpan di profil, hanya cadangan
 *   5. default      — Bahasa Indonesia
 *
 * @param {string} key          kunci di lang/daerah/*.php, mis. 'album_index'
 * @param {object} replacements placeholder gaya Laravel, mis. { name: 'Andi' }
 */
export function useRegionalGreeting(key, replacements = {}) {
    const { daerah: serverPayload = null } = usePage().props;

    const { payload: detectedPayload, isDetecting } = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    useEffect(() => {
        ensureDetection(serverPayload);
    }, [serverPayload]);

    // Deteksi perangkat (GPS → IP) menang atas payload server, karena sapaan
    // harus mengikuti lokasi user SAAT INI — bukan provinsi di profil, yang
    // sudah usang begitu user bepergian. Pengecualiannya cuma 'forced': tanpa
    // itu, nilai di .env kalah oleh cache deteksi di localStorage sehingga
    // tampilan tidak berubah sama sekali saat diuji.
    //
    // Deteksi yang GAGAL mengembalikan source 'default' (provinsi null); itu
    // tidak boleh menang atas provinsi profil, jadi hanya hasil yang benar-benar
    // menemukan lokasi yang dipakai.
    const detectedWins =
        detectedPayload?.source === 'geolocation' || detectedPayload?.source === 'ip';

    const payload = isAuthoritative(serverPayload)
        ? serverPayload
        : detectedWins
          ? detectedPayload
          : serverPayload ?? detectedPayload;

    let greeting = payload?.phrases?.[key] ?? '';

    for (const [token, value] of Object.entries(replacements)) {
        greeting = greeting.replaceAll(`:${token}`, String(value ?? ''));
    }

    return {
        greeting,

        // Bahasa yang benar-benar dipakai untuk kunci ini — bisa berbeda dari
        // bahasa provinsi bila kuncinya mundur ke bahasa pulau / Indonesia.
        language: payload?.resolved_from?.[key] ?? payload?.language ?? null,

        // Konteks tambahan untuk debugging & atribut lang.
        provinceLanguage: payload?.language ?? null,
        province: payload?.province ?? null,
        island: payload?.island ?? null,
        chain: payload?.chain ?? [],
        source: payload?.source ?? 'default',
        isDetecting,
    };
}

export default useRegionalGreeting;
