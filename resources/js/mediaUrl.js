/**
 * Resolve a stored image path to a browsable URL.
 *
 * The database holds three shapes of path, and this keeps every render site
 * consistent when displaying them:
 *   - absolute URLs ("http…")                     → used as-is (e.g. Google avatars);
 *   - legacy/seeded public assets                 → served from the web root:
 *       • "/images/…" (already rooted)               used as-is;
 *       • bare "images/…" (seeded badge icons)       re-rooted at "/";
 *   - files on the "public" storage disk          → served through the /storage
 *       (bare paths like "badge-icons/x.webp",        symlink.
 *        "category-icons/…", "news-thumbnails/…")
 */
export function mediaUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    if (path.startsWith('images/')) return `/${path}`;

    return `/storage/${path}`;
}

export default mediaUrl;
