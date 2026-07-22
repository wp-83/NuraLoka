import { FaMedal } from 'react-icons/fa';
import { mediaUrl } from '@js/mediaUrl';

/**
 * Ukuran lencana.
 *
 * sm/md/lg DIBIARKAN seperti semula karena dipakai leaderboard, halaman profil,
 * dan ringkasan Tantangan — mengubahnya akan menggeser tata letak di sana.
 * Ukuran besar untuk halaman daftar lencana ditambahkan sebagai xl/2xl, dan
 * ikut mengecil di layar sempit.
 */
const SIZE_CLASSES = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    // Naik di md, bukan sm: tepat di 640px kolom tingkatan (4 kolom) hanya
    // selebar 128px, jadi lencana 128px akan mengisi kolomnya tanpa sisa.
    xl: 'w-28 h-28 md:w-32 md:h-32',
    '2xl': 'w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44',
};

// Full-picture badge icon — no circular/bordered frame, matches Admin/Badge/Index.jsx.
// `earned={false}` dims the icon to show it's still locked.
export default function BadgeIcon({ iconPath, alt = '', earned = true, size = 'md', className = '' }) {
    const sizeClass = SIZE_CLASSES[size] ?? size;
    const dim = earned ? '' : 'grayscale opacity-45';

    if (!iconPath) {
        return <FaMedal className={`${sizeClass} ${className} shrink-0 text-gray-300 ${dim}`} />;
    }

    return (
        <img
            src={mediaUrl(iconPath)}
            alt={alt}
            className={`${sizeClass} ${className} shrink-0 object-contain ${dim}`}
        />
    );
}
