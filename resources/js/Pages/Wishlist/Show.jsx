import MainLayout from '@js/Layouts/MainLayout';
import PlaceDetail from '@components/Features/PlaceDetail';
import { useTranslation } from '@js/i18n';

/**
 * Place detail, reached from the wishlist.
 *
 * Uses the SAME PlaceDetail component as the Explore detail page. This page once
 * had its own copy of the layout, which had drifted badly out of date.
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
