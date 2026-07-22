import MainLayout from '@js/Layouts/MainLayout';
import PlaceDetail from '@components/Features/PlaceDetail';
import { useTranslation } from '@js/i18n';

/**
 * Place detail, reached from Explore.
 *
 * All of it lives in the PlaceDetail component, shared with the Wishlist detail
 * page (Wishlist/Show): the two show the same thing, so they must not look
 * different. Only the back button differs.
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
