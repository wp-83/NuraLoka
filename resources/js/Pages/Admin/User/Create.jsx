import PageHeader from '@components/Common/PageHeader';
import UserForm from '@js/Pages/Admin/User/UserForm';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

export default function Create({ provinces = [] }) {
    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.users.create_title')}
                description={t('admin.users.create_description')}
            />

            <UserForm provinces={provinces} />
        </div>
    );
}

Create.layout = (page) => (
    <AdminLayout
        pageTitle="title.admin_user_create"
        content={page}
    />
);
