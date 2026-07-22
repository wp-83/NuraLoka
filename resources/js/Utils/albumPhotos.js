/**
 * Album photo upload rules, shared by the Create Album and Edit Album pages.
 *
 * The limit MUST match AlbumController::PHOTO_MAX_KB (10 MB) — the client-side
 * check exists only to tell the user sooner; the server still decides.
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
 * Split the files worth uploading from the rejected ones, with a ready-to-show
 * error message. `t` is the translate function from useTranslation().
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
 * Collect the server's photo-upload errors.
 *
 * Laravel keys them per file ("photos.0", "photos.1"), not just "photos", so a
 * page reading only errors.photos shows nothing at all.
 */
export function photoErrorsFrom(errors = {}) {
    return Object.entries(errors)
        .filter(([key]) => key === 'photos' || key.startsWith('photos.'))
        .map(([, message]) => message)
        .filter(Boolean)
        .join(' ');
}
