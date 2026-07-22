/**
 * Client-side region detection.
 *
 * Stage 1 (the user's saved province) is NOT here — the server has already
 * settled that and it arrives in the Inertia props. This module covers stage 2
 * (browser Geolocation) and stage 3 (IP geolocation, done by the server).
 */

const GEOLOCATION_TIMEOUT_MS = 8000;

/**
 * Ask the browser for coordinates. Returns null when permission is denied,
 * geolocation is unsupported, or the request times out — a denied permission is
 * a normal path, not an error worth showing the user.
 */
function requestCoordinates() {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            resolve(null);
            return;
        }

        let settled = false;

        const finish = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        navigator.geolocation.getCurrentPosition(
            (position) =>
                finish({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }),
            () => finish(null),
            {
                timeout: GEOLOCATION_TIMEOUT_MS,
                maximumAge: 1000 * 60 * 30,
                enableHighAccuracy: false,
            },
        );

        // Safety net: some browsers never call the error callback when the
        // permission dialog is simply ignored.
        window.setTimeout(() => finish(null), GEOLOCATION_TIMEOUT_MS + 500);
    });
}

function csrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

/**
 * Ask the server for the greeting at given coordinates. With no coordinates the
 * server tries IP geolocation and then falls back to Indonesian.
 */
async function resolveOnServer(coordinates) {
    const response = await fetch('/bahasa-daerah/deteksi', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(coordinates ?? {}),
    });

    if (!response.ok) return null;

    return response.json();
}

/**
 * Run the full detection: browser coordinates → server (coordinates or IP).
 * Returns the greeting payload, or null if everything failed — the caller still
 * has the default payload from the Inertia props as its last safety net.
 */
export async function detectRegion() {
    try {
        const coordinates = await requestCoordinates();

        return await resolveOnServer(coordinates);
    } catch {
        // Network down or request aborted. This feature is a nicety — stay quiet.
        return null;
    }
}
