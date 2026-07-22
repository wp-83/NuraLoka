/**
 * Aturan unggah foto album, dipakai bersama halaman Buat Album dan Ubah Album.
 *
 * Batasnya HARUS sama dengan AlbumController::PHOTO_MAX_KB (10 MB) — pemeriksaan
 * di sisi klien hanya supaya user tahu lebih cepat; server tetap yang memutuskan.
 */
export const PHOTO_MAX_MB = 10;
export const PHOTO_MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024;
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/jpg,image/webp';

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
];

/**
 * Pisahkan berkas yang layak diunggah dari yang ditolak, lengkap dengan pesan
 * error siap tampil. `t` adalah fungsi terjemahan dari useTranslation().
 */
export function screenPhotos(files, t) {
    const accepted = [];
    const tooLarge = [];
    const wrongType = [];

    files.forEach((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            wrongType.push(file.name);
            return;
        }

        if (file.size > PHOTO_MAX_BYTES) {
            tooLarge.push(file.name);
            return;
        }

        accepted.push(file);
    });

    const messages = [];

    if (tooLarge.length > 0) {
        messages.push(
            `${t('album.photo_error_size', { max: PHOTO_MAX_MB })} (${tooLarge.join(', ')})`
        );
    }

    if (wrongType.length > 0) {
        messages.push(
            `${t('album.photo_error_type')} (${wrongType.join(', ')})`
        );
    }

    return {
        accepted,
        error: messages.join(' '),
    };
}

/**
 * Kumpulkan pesan error unggah foto dari server. Laravel memberi kunci per
 * berkas ("photos.0", "photos.1"), bukan hanya "photos" — dulu pesan itu tidak
 * pernah muncul karena halaman hanya membaca errors.photos.
 */
export function photoErrorsFrom(errors = {}) {
    return Object.entries(errors)
        .filter(([key]) => key === 'photos' || key.startsWith('photos.'))
        .map(([, message]) => message)
        .filter(Boolean)
        .join(' ');
}
