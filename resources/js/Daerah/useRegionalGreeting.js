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
 * Sumber payload, berurutan:
 *   1. props Inertia `daerah` bila server memakai provinsi profil user
 *   2. hasil deteksi klien (Geolocation → IP), disimpan di store modul
 *   3. payload default dari server (Bahasa Indonesia)
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

    // Payload server menang atas hasil deteksi perangkat untuk dua sumber:
    //   user_profile — provinsi tersimpan milik user, sumber paling tepercaya;
    //   forced       — DAERAH_FORCE_PROVINCE / ?daerah=, memang untuk memaksa.
    // Tanpa 'forced', nilai di .env kalah oleh cache deteksi di localStorage,
    // sehingga tampilan tidak berubah sama sekali.
    const payload = isAuthoritative(serverPayload)
        ? serverPayload
        : detectedPayload ?? serverPayload;

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
