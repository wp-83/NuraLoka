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
 * Hook for the regional-language greeting.
 *
 *   const { greeting } = useRegionalGreeting('home_hero');
 *   <p className="local-language">{greeting}</p>
 *
 * DELIBERATELY not built on useTranslation(): a regional greeting must not
 * change when the user switches the application language to en or ko.
 *
 * Payload sources, strongest first:
 *   1. forced       — DAERAH_FORCE_PROVINCE / ?daerah=, the testing tool
 *   2. geolocation  — the user's GPS location right NOW, the feature's main source
 *   3. ip           — a location guessed from the IP address
 *   4. user_profile — the province saved on the profile, a fallback only
 *   5. default      — Indonesian
 *
 * @param {string} key          a key in lang/daerah/*.php, e.g. 'album_index'
 * @param {object} replacements Laravel-style placeholders, e.g. { name: 'Andi' }
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

    // Device detection (GPS → IP) beats the server payload, because the greeting
    // must follow where the user is NOW — not the province on their profile,
    // which is stale the moment they travel. The one exception is 'forced':
    // without it the .env value would lose to the detection cache in
    // localStorage and the display would not change at all while testing.
    //
    // A FAILED detection returns source 'default' (province null); that must not
    // beat the profile's province, so only a detection that genuinely found a
    // location is used.
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

        // The language actually used for THIS key — it can differ from the
        // province's language when the key falls back to the island language or
        // to Indonesian.
        language: payload?.resolved_from?.[key] ?? payload?.language ?? null,

        // Extra context, for debugging and for the lang attribute.
        provinceLanguage: payload?.language ?? null,
        province: payload?.province ?? null,
        island: payload?.island ?? null,
        chain: payload?.chain ?? [],
        source: payload?.source ?? 'default',
        isDetecting,
    };
}

export default useRegionalGreeting;
