import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';

import { useForm } from '@inertiajs/react';

import {
    FiArrowLeft,
    FiLock,
    FiMail,
    FiSave,
    FiUser,
} from 'react-icons/fi';

export default function UserForm({
    user = null,
    provinces = [],
}) {
    const isEdit = Boolean(user);

    const { data, setData, post, put, processing, errors } =
        useForm({
            username: user?.username ?? '',
            email: user?.email ?? '',
            password: '',
            password_confirmation: '',
            is_admin: user?.is_admin ? '1' : '0',
            fullname: user?.user_detail?.fullname ?? '',
            dob: user?.user_detail?.dob ?? '',
            gender: user?.user_detail?.gender ?? 'unspecified',
            province_id:
                user?.user_detail?.province_id?.toString() ?? '',
        });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route('admin.users.update', user.id),
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        post(route('admin.users.store'), {
            preserveScroll: true,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
        >
            {/* Informasi Akun */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-paragraph font-bold text-primary-100">
                        Informasi Akun
                    </h2>

                    <p className="mt-1 font-body text-small text-gray-60">
                        Atur informasi utama dan hak akses akun.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Username"
                        name="username"
                        value={data.username}
                        onChange={(e) =>
                            setData('username', e.target.value)
                        }
                        placeholder="Masukkan username"
                        icon={<FiUser size={20} />}
                        error={errors.username}
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData('email', e.target.value)
                        }
                        placeholder="Masukkan email"
                        icon={<FiMail size={20} />}
                        error={errors.email}
                        required
                    />

                    <Dropdown
                        label="Role"
                        name="is_admin"
                        value={data.is_admin}
                        onChange={(e) =>
                            setData('is_admin', e.target.value)
                        }
                        options={[
                            {
                                value: '0',
                                label: 'Pengguna',
                            },
                            {
                                value: '1',
                                label: 'Admin',
                            },
                        ]}
                        error={errors.is_admin}
                    />
                </div>
            </div>

            {/* Informasi Pribadi */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-paragraph font-bold text-primary-100">
                        Informasi Pribadi
                    </h2>

                    <p className="mt-1 font-body text-small text-gray-60">
                        Lengkapi informasi pribadi pengguna.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Nama Lengkap"
                        name="fullname"
                        value={data.fullname}
                        onChange={(e) =>
                            setData('fullname', e.target.value)
                        }
                        placeholder="Masukkan nama lengkap"
                        icon={<FiUser size={20} />}
                        error={errors.fullname}
                        required
                    />

                    <Input
                        label="Tanggal Lahir"
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) =>
                            setData('dob', e.target.value)
                        }
                        error={errors.dob}
                        required
                    />

                    <Dropdown
                        label="Jenis Kelamin"
                        name="gender"
                        value={data.gender}
                        onChange={(e) =>
                            setData('gender', e.target.value)
                        }
                        options={[
                            {
                                value: 'male',
                                label: 'Laki-laki',
                            },
                            {
                                value: 'female',
                                label: 'Perempuan',
                            },
                            {
                                value: 'unspecified',
                                label: 'Tidak ingin memberi tahu',
                            },
                        ]}
                        error={errors.gender}
                    />

                    <Dropdown
                        label="Provinsi"
                        name="province_id"
                        value={data.province_id}
                        onChange={(e) =>
                            setData(
                                'province_id',
                                e.target.value,
                            )
                        }
                        placeholder="Pilih provinsi"
                        options={provinces.map((province) => ({
                            value: province.id.toString(),
                            label: province.name,
                        }))}
                        error={errors.province_id}
                    />
                </div>
            </div>

            {/* Password */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-paragraph font-bold text-primary-100">
                        {isEdit
                            ? 'Ubah Password'
                            : 'Password'}
                    </h2>

                    <p className="mt-1 font-body text-small text-gray-60">
                        {isEdit
                            ? 'Kosongkan password jika tidak ingin mengubahnya.'
                            : 'Buat password untuk akun pengguna.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label={
                            isEdit
                                ? 'Password Baru'
                                : 'Password'
                        }
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(e) =>
                            setData('password', e.target.value)
                        }
                        placeholder="Masukkan password"
                        icon={<FiLock size={20} />}
                        error={errors.password}
                        required={!isEdit}
                    />

                    <Input
                        label="Konfirmasi Password"
                        name="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData(
                                'password_confirmation',
                                e.target.value,
                            )
                        }
                        placeholder="Ulangi password"
                        icon={<FiLock size={20} />}
                        error={errors.password_confirmation}
                        required={!isEdit}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="white"
                    iconLeft={<FiArrowLeft size={18} />}
                    onClick={() => window.history.back()}
                >
                    Kembali
                </Button>

                <Button
                    type="submit"
                    loading={processing}
                    iconLeft={
                        !processing && <FiSave size={18} />
                    }
                >
                    {isEdit
                        ? 'Simpan Perubahan'
                        : 'Tambah Pengguna'}
                </Button>
            </div>
        </form>
    );
}
