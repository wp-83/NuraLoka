/**
 * localStorage cache for the region-detection result.
 *
 * It exists to stop the browser asking for location permission again on every
 * page change. The cache is only refreshed when the detected location moves to
 * a different PROVINCE — while the province is the same, the stored payload
 * keeps being used.
 */

const STORAGE_KEY = 'nuraloka.daerah';

// Bump when the payload shape changes, so an older cache is ignored rather than
// read as malformed data.
const VERSION = 1;

// NuraLoka is a travel app — users really do cross provinces, so the greeting
// must not stay locked to an old location for days. Kept in step with the
// position `maximumAge` in detector.js so the store cache and the browser's
// position cache age together. Raise it if the permission dialog feels too
// frequent.
const MAX_AGE_MS = 1000 * 60 * 30;

function isStorageAvailable() {
    try {
        return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
        // Safari in private mode throws on touching localStorage.
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

        // Same location → nothing to rewrite.
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
        // Quota full or storage blocked. This feature is optional — ignore it.
    }
}

export function clearCache() {
    if (!isStorageAvailable()) return;

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore.
    }
}
