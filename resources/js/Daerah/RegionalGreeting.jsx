import { useRegionalGreeting } from './useRegionalGreeting';

/**
 * Sapaan bahasa daerah di bawah judul halaman / hero.
 *
 * Gaya visualnya memakai kelas .local-language yang sudah didefinisikan di
 * resources/css/app.css — komponen ini tidak mendefinisikan gaya sendiri supaya
 * seluruh sapaan daerah tampil konsisten. `className` hanya untuk penyesuaian
 * per tempat (mis. warna terang di atas hero gelap).
 *
 * Tidak merender apa pun bila frasanya kosong, sehingga tidak meninggalkan
 * ruang kosong di layout.
 */
export default function RegionalGreeting({
    phrase,
    replacements = {},
    className = '',
    as: Tag = 'p',
}) {
    const { greeting, language } = useRegionalGreeting(phrase, replacements);

    if (!greeting) return null;

    return (
        <Tag
            className={`local-language ${className}`.trim()}
            data-daerah={language ?? undefined}
        >
            {greeting}
        </Tag>
    );
}
