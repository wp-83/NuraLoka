import UserForm from '@js/Pages/Admin/User/UserForm';
import AdminLayout from '@js/Layouts/AdminLayout';

export default function Edit({
    user,
    provinces = [],
}) {
    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-title font-bold text-primary-100">
                    Edit Pengguna
                </h1>

                <p className="mt-1 font-body text-body text-gray-70">
                    Perbarui informasi akun dan data pribadi
                    pengguna.
                </p>
            </div>

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
