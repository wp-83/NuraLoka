import MainLayout from '@js/Layouts/MainLayout';
import PlaceDetail from '@components/Features/PlaceDetail';
import { useTranslation } from '@js/i18n';

/**
 * Detail tempat dari halaman Jelajah.
 *
 * Seluruh isinya ada di komponen PlaceDetail yang dipakai bersama halaman
 * Impian (Wishlist/Show) — dua halaman ini memang menampilkan hal yang sama,
 * jadi tampilannya tidak boleh berbeda. Yang berbeda hanya tombol kembali.
 */
export default function Show(props) {
    const { t } = useTranslation();

    return (
        <PlaceDetail
            {...props}
            backHref={route('explore.index')}
            backLabel={t('explore.back_to_explore')}
        />
    );
}

Show.layout = (page) => (
    <MainLayout
        pageTitle="title.explore"
        pageDescription="Jelajahi informasi lengkap tentang destinasi wisata, mulai dari lokasi, kategori, hingga inspirasi perjalanan bersama NuraLoka."
        content={page}
    />
);
