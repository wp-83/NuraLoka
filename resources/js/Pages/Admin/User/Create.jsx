import UserForm from '@js/Pages/Admin/User/UserForm';
import AdminLayout from '@js/Layouts/AdminLayout';

export default function Create({ provinces = [] }) {
    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-title font-bold text-primary-100">
                    Tambah Pengguna Baru
                </h1>

                <p className="mt-1 font-body text-body text-gray-70">
                    Buat akun pengguna baru dan lengkapi
                    informasi pengguna.
                </p>
            </div>

            <UserForm provinces={provinces} />
        </div>
    );
}

Create.layout = (page) => (
    <AdminLayout
        pageTitle="Tambah Pengguna Baru"
        content={page}
    />
);
