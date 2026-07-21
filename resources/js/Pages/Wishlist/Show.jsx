import MainLayout from '@js/Layouts/MainLayout';
import PlaceDetail from '@components/Features/PlaceDetail';
import { useTranslation } from '@js/i18n';

/**
 * Detail tempat dari halaman Impian.
 *
 * Memakai komponen PlaceDetail yang SAMA dengan detail di Jelajah. Sebelumnya
 * halaman ini punya salinan tata letaknya sendiri yang sudah tertinggal jauh:
 * galerinya mengulang satu gambar delapan kali, tidak menampilkan jumlah
 * pengunjung maupun jumlah album, dan harganya cuma teks statis.
 */
export default function Show(props) {
    const { t } = useTranslation();

    return (
        <PlaceDetail
            {...props}
            backHref={route('wishlist.index')}
            backLabel={t('wishlist.back_to_wishlist')}
        />
    );
}

Show.layout = (page) => (
    <MainLayout
        pageTitle="title.wishlist"
        pageDescription="Temukan informasi lengkap tentang destinasi wisata, mulai dari lokasi, kategori, hingga inspirasi perjalanan bersama NuraLoka."
        content={page}
    />
);
