import { readCache, writeCache } from './cache';
import { detectRegion } from './detector';

/**
 * Module-level store for the region-detection result (deliberately not a React
 * context).
 *
 * Chosen so detection runs ONCE per page load however many greetings are on
 * screen, without having to wrap Inertia's <App> — wrapping it would break
 * usePage() and force us to reimplement Inertia's own layout resolution.
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

// Snapshot for SSR / the first render on the server: no client detection yet.
const serverSnapshot = { payload: null, isDetecting: false };

export function getServerSnapshot() {
    return serverSnapshot;
}

/**
 * Whether the server payload is final, so client detection need not run — and
 * must not overwrite it.
 *
 * ONLY 'forced' qualifies (DAERAH_FORCE_PROVINCE in .env, or ?daerah= in the
 * URL), since that is precisely the tool for pinning the display while testing.
 *
 * 'user_profile' is DELIBERATELY no longer final: the greeting should follow
 * where the user is NOW via GPS, not the province saved on their profile. That
 * saved province stays as the fallback for when GPS and IP both fail.
 */
export function isAuthoritative(payload) {
    return payload?.source === 'forced';
}

let detectionStarted = false;

/**
 * Run the detection chain if it is actually needed.
 *
 * Skipped ONLY when the server payload is forced, or when a previous detection
 * is still cached — that cache is what stops the location permission dialog
 * reappearing on every page change.
 *
 * Signed-in users are detected too: the province on their profile is no longer
 * the final answer, only the last fallback.
 */
export function ensureDetection(serverPayload) {
    if (detectionStarted) return;
    if (typeof window === 'undefined') return;

    // Forced for testing — do not run a detection that would overwrite it.
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

/** Force a re-detection — e.g. after the user changes their province. */
export function resetDetection() {
    detectionStarted = false;
    emit({ payload: null, isDetecting: false });
}
