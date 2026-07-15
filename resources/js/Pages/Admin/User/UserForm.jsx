import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';

import {
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    useEffect,
    useState,
} from 'react';

import {
    FiArrowLeft,
    FiCamera,
    FiLock,
    FiMail,
    FiSave,
    FiUser,
} from 'react-icons/fi';

export default function UserForm({
    user = null,
    provinces = [],
}) {
    const authUser =
        usePage().props.auth.user;

    const isEdit = Boolean(user);

    const isOwnAccount =
        isEdit &&
        user.id == authUser.id;

    const [photoPreview, setPhotoPreview] =
        useState(
            user?.public_profile_photo ?? null,
        );

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        _method:
            isEdit
                ? 'put'
                : undefined,

        username:
            user?.username ?? '',

        email:
            user?.email ?? '',

        password: '',

        password_confirmation: '',

        is_admin:
            user?.is_admin
                ? '1'
                : '0',

        fullname:
            user?.user_detail?.fullname ?? '',

        dob:
            user?.user_detail?.dob ?? '',

        gender:
            user?.user_detail?.gender ??
            'unspecified',

        province_id:
            user?.user_detail?.province_id
                ?.toString() ?? '',

        profile_photo: null,
    });

    /*
    |--------------------------------------------------------------------------
    | Profile Photo Preview
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!data.profile_photo) {
            setPhotoPreview(
                user?.public_profile_photo ?? null,
            );

            return;
        }

        const previewUrl =
            URL.createObjectURL(
                data.profile_photo,
            );

        setPhotoPreview(previewUrl);

        return () => {
            URL.revokeObjectURL(
                previewUrl,
            );
        };
    }, [
        data.profile_photo,
        user?.public_profile_photo,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            post(
                route(
                    'admin.users.update',
                    user.id,
                ),
                {
                    preserveScroll: true,
                    forceFormData: true,
                },
            );

            return;
        }

        post(
            route('admin.users.store'),
            {
                preserveScroll: true,
                forceFormData: true,
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
        >
            {/* Back */}
            <div>
                <Button
                    type="button"
                    variant="white"
                    iconLeft={
                        <FiArrowLeft size={18} />
                    }
                    onClick={() =>
                        window.history.back()
                    }
                >
                    Kembali
                </Button>
            </div>

            {/* Foto Profil */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-subtitle font-bold text-primary-100">
                        Foto Profil
                    </h2>

                    <p className="mt-1 font-body text-body text-gray-50">
                        Unggah foto profil pengguna.
                        Maksimal 2 MB.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <img
                        src={
                            photoPreview ??
                            '/images/default-profile.png'
                        }
                        alt="Preview foto profil"
                        className="h-32 w-32 rounded-full object-cover"
                    />

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="profile_photo"
                            className="
                                inline-flex
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-primary-100
                                px-4
                                py-3
                                font-body
                                text-body
                                text-white
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:opacity-70
                            "
                        >
                            <FiCamera size={18} />

                            Pilih Foto
                        </label>

                        <input
                            id="profile_photo"
                            name="profile_photo"
                            type="file"
                            accept="
                                image/jpeg,
                                image/png,
                                image/webp
                            "
                            className="hidden"
                            onChange={(e) =>
                                setData(
                                    'profile_photo',
                                    e.target
                                        .files?.[0] ??
                                        null,
                                )
                            }
                        />

                        {data.profile_photo && (
                            <p className="max-w-64 truncate font-body text-small text-gray-50">
                                {
                                    data
                                        .profile_photo
                                        .name
                                }
                            </p>
                        )}

                        {errors.profile_photo && (
                            <p className="font-body text-small italic text-error-dark">
                                {
                                    errors.profile_photo
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Informasi Akun */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-subtitle font-bold text-primary-100">
                        Informasi Akun
                    </h2>

                    <p className="mt-1 font-body text-body text-gray-50">
                        Atur informasi utama dan hak
                        akses akun.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Username"
                        name="username"
                        value={data.username}
                        onChange={(e) =>
                            setData(
                                'username',
                                e.target.value,
                            )
                        }
                        placeholder="Masukkan username"
                        icon={
                            <FiUser size={20} />
                        }
                        error={errors.username}
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData(
                                'email',
                                e.target.value,
                            )
                        }
                        placeholder="Masukkan email"
                        icon={
                            <FiMail size={20} />
                        }
                        error={errors.email}
                        required
                    />

                    <Dropdown
                        label="Role"
                        name="is_admin"
                        value={data.is_admin}
                        onChange={(e) =>
                            setData(
                                'is_admin',
                                e.target.value,
                            )
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
                        disabled={isOwnAccount}
                        required
                    />
                </div>
            </div>

            {/* Informasi Pribadi */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-subtitle font-bold text-primary-100">
                        Informasi Pribadi
                    </h2>

                    <p className="mt-1 font-body text-body text-gray-50">
                        Lengkapi informasi pribadi
                        Nuravers.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Nama Lengkap"
                        name="fullname"
                        value={data.fullname}
                        onChange={(e) =>
                            setData(
                                'fullname',
                                e.target.value,
                            )
                        }
                        placeholder="Masukkan nama lengkap"
                        icon={
                            <FiUser size={20} />
                        }
                        error={errors.fullname}
                        required
                    />

                    <Input
                        label="Tanggal Lahir"
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) =>
                            setData(
                                'dob',
                                e.target.value,
                            )
                        }
                        error={errors.dob}
                        required
                    />

                    <Dropdown
                        label="Jenis Kelamin"
                        name="gender"
                        value={data.gender}
                        onChange={(e) =>
                            setData(
                                'gender',
                                e.target.value,
                            )
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
                                label:
                                    'Tidak ingin memberi tahu',
                            },
                        ]}
                        error={errors.gender}
                        required
                    />

                    <Dropdown
                        label="Provinsi Domisili"
                        name="province_id"
                        value={data.province_id}
                        onChange={(e) =>
                            setData(
                                'province_id',
                                e.target.value,
                            )
                        }
                        placeholder="Pilih provinsi"
                        options={provinces.map(
                            (province) => ({
                                value:
                                    province.id.toString(),
                                label:
                                    province.name,
                            }),
                        )}
                        error={
                            errors.province_id
                        }
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-heading text-subtitle font-bold text-primary-100">
                        {isEdit
                            ? 'Ubah Kata Sandi'
                            : 'Kata Sandi'}
                    </h2>

                    <p className="mt-1 font-body text-body text-gray-50">
                        {isEdit
                            ? 'Kosongkan kata sandi jika tidak ingin mengubahnya.'
                            : 'Buat kata sandi untuk akun Nuravers.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label={
                            isEdit
                                ? 'Kata Sandi Baru'
                                : 'Kata Sandi'
                        }
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(e) =>
                            setData(
                                'password',
                                e.target.value,
                            )
                        }
                        placeholder="Masukkan kata sandi"
                        icon={
                            <FiLock size={20} />
                        }
                        error={errors.password}
                        required={!isEdit}
                    />

                    <Input
                        label="Konfirmasi Kata Sandi"
                        name="password_confirmation"
                        type="password"
                        value={
                            data.password_confirmation
                        }
                        onChange={(e) =>
                            setData(
                                'password_confirmation',
                                e.target.value,
                            )
                        }
                        placeholder="Ulangi kata sandi"
                        icon={
                            <FiLock size={20} />
                        }
                        error={
                            errors.password_confirmation
                        }
                        required={!isEdit}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    loading={processing}
                    iconLeft={
                        !processing && (
                            <FiSave size={18} />
                        )
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
