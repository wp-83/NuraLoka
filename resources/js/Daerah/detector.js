/**
 * Deteksi wilayah di sisi klien.
 *
 * Tahap 1 (provinsi tersimpan milik user) TIDAK ada di sini — itu sudah
 * diselesaikan server dan ikut di props Inertia. Modul ini menangani tahap 2
 * (Geolocation browser) dan tahap 3 (geolokasi IP, dikerjakan server).
 */

const GEOLOCATION_TIMEOUT_MS = 8000;

/**
 * Minta koordinat dari browser. Mengembalikan null bila izin ditolak, tidak
 * didukung, atau melebihi batas waktu — penolakan izin adalah jalur normal,
 * bukan error yang perlu ditampilkan ke pengguna.
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

        // Jaring pengaman: sebagian browser tidak pernah memanggil callback error
        // bila dialog izin diabaikan begitu saja.
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
 * Tanyakan ke server sapaan untuk koordinat tertentu. Tanpa koordinat, server
 * mencoba geolokasi IP lalu mundur ke Bahasa Indonesia.
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
 * Jalankan deteksi lengkap: koordinat browser → server (koordinat/IP).
 * Mengembalikan payload sapaan, atau null bila semuanya gagal — pemanggil tetap
 * punya payload default dari props Inertia sebagai jaring pengaman terakhir.
 */
export async function detectRegion() {
    try {
        const coordinates = await requestCoordinates();

        return await resolveOnServer(coordinates);
    } catch {
        // Jaringan mati / permintaan dibatalkan. Fitur ini pelengkap, jadi diam saja.
        return null;
    }
}
