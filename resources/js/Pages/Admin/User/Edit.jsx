import PageHeader from '@components/Common/PageHeader';
import UserForm from '@js/Pages/Admin/User/UserForm';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

export default function Edit({
    user,
    provinces = [],
}) {
    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.users.edit_title')}
                description={t('admin.users.edit_description')}
            />

            <UserForm
                user={user}
                provinces={provinces}
            />
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout
        pageTitle="Edit Pengguna"
        content={page}
    />
);
