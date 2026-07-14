import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import MainLayout from '@js/Layouts/MainLayout';

import {
    FiArrowLeft,
    FiUpload,
} from 'react-icons/fi';

export default function Edit({ user, provinces }) {
    const [avatarPreview, setAvatarPreview] = useState(
        user.public_profile_photo
    );

    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
    } = useForm({
        fullname: user.user_detail?.fullname ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        dob: user.user_detail?.dob ?? '',
        gender: user.user_detail?.gender ?? 'unspecified',
        province_id: user.user_detail?.province_id ?? '',
        password: '',
        password_confirmation: '',
        profile_photo: null,

        _method: 'PUT',
    });

    const genderOptions = [
        {
            value: 'male',
            label: 'Laki-Laki',
        },
        {
            value: 'female',
            label: 'Perempuan',
        },
        {
            value: 'unspecified',
            label: 'Tidak Ditentukan',
        },
    ];

    const provinceOptions = provinces.map((province) => ({
        value: province.id,
        label: province.name,
    }));

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setData('profile_photo', file);

        const previewUrl = URL.createObjectURL(file);

        setAvatarPreview((currentPreview) => {
            if (currentPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreview);
            }

            return previewUrl;
        });
    };

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className="container w-full py-10 sm:py-12 lg:py-14">
            {/* PAGE HEADER */}
            <h1 className="font-heading text-subtitle font-bold text-primary sm:text-title">
                Perbarui Data Profil Kamu
            </h1>

            {/* BACK BUTTON */}
            <div className="mt-5">
                <Link href={route('profile.index')}>
                    <Button
                        variant="primary"
                        size="btn-md"
                        iconLeft={<FiArrowLeft />}
                    >
                        Kembali
                    </Button>
                </Link>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="
                    mt-8
                    grid
                    grid-cols-1
                    gap-10
                    lg:grid-cols-[minmax(0,1fr)_280px]
                    lg:gap-16
                "
            >
                {/* PROFILE PHOTO */}
                <div
                    className="
                        order-1
                        flex
                        flex-col
                        items-center
                        lg:order-2
                    "
                >
                    <p className="mb-3 font-heading text-paragraph text-primary-100">
                        Foto Profil
                    </p>

                    <label
                        htmlFor="profile_photo"
                        className="
                            group
                            relative
                            block
                            h-52
                            w-52
                            cursor-pointer
                            overflow-hidden
                            rounded-full
                            border-4
                            border-secondary
                            bg-white
                            p-1
                            sm:h-60
                            sm:w-60
                        "
                    >
                        <img
                            src={avatarPreview}
                            alt={`Foto profil ${data.fullname}`}
                            className="
                                h-full
                                w-full
                                rounded-full
                                object-cover
                            "
                        />

                        <div
                            className="
                                absolute
                                inset-1
                                flex
                                items-center
                                justify-center
                                rounded-full
                                bg-black/50
                                opacity-0
                                transition-opacity
                                duration-200
                                group-hover:opacity-100
                            "
                        >
                            <div className="flex flex-col items-center gap-2 font-body text-small text-white">
                                <FiUpload size={24} />
                                <span>Ganti Foto</span>
                            </div>
                        </div>
                    </label>

                    <input
                        id="profile_photo"
                        name="profile_photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />

                    {errors.profile_photo && (
                        <p className="mt-2 font-body text-small italic text-error-dark">
                            {errors.profile_photo}
                        </p>
                    )}

                    <p className="mt-3 max-w-72 text-center font-body text-body text-gray-50">
                        Klik foto untuk mengganti foto profil.
                        Hanya mendukung format JPG, PNG, atau WebP.
                    </p>
                </div>

                {/* FORM FIELDS */}
                <div
                    className="
                        order-2
                        grid
                        grid-cols-1
                        gap-x-10
                        gap-y-4
                        md:grid-cols-2
                        lg:order-1
                    "
                >
                    {/* FULLNAME */}
                    <Input
                        label="Nama Lengkap"
                        name="fullname"
                        type="text"
                        value={data.fullname}
                        onChange={(event) =>
                            setData('fullname', event.target.value)
                        }
                        placeholder="Masukkan nama lengkap kamu"
                        error={errors.fullname}
                        autoComplete="name"
                        required
                    />

                    {/* USERNAME */}
                    <Input
                        label="Username"
                        name="username"
                        type="text"
                        value={data.username}
                        onChange={(event) =>
                            setData('username', event.target.value)
                        }
                        placeholder="Masukkan username"
                        error={errors.username}
                        autoComplete="username"
                        required
                    />

                    {/* EMAIL */}
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        placeholder="Masukkan email kamu"
                        error={errors.email}
                        autoComplete="email"
                        required
                    />

                    {/* DATE OF BIRTH */}
                    <Input
                        label="Tanggal Lahir"
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={(event) =>
                            setData('dob', event.target.value)
                        }
                        error={errors.dob}
                        required
                    />

                    {/* GENDER */}
                    <Dropdown
                        label="Jenis Kelamin"
                        name="gender"
                        value={data.gender}
                        onChange={(event) =>
                            setData('gender', event.target.value)
                        }
                        options={genderOptions}
                        placeholder="Pilih jenis kelamin"
                        error={errors.gender}
                        required
                    />

                    {/* PROVINCE */}
                    <Dropdown
                        label="Provinsi Domisili"
                        name="province_id"
                        value={data.province_id}
                        onChange={(event) =>
                            setData('province_id', event.target.value)
                        }
                        options={provinceOptions}
                        placeholder="Pilih provinsi"
                        error={errors.province_id}
                        required
                    />

                    {/* PASSWORD */}
                    <Input
                        label="Kata Sandi Baru"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        placeholder="Kosongkan jika tidak ingin mengganti"
                        error={errors.password}
                        autoComplete="new-password"
                    />

                    {/* PASSWORD CONFIRMATION */}
                    <Input
                        label="Konfirmasi Kata Sandi Baru"
                        name="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData(
                                'password_confirmation',
                                event.target.value
                            )
                        }
                        placeholder="Ulangi kata sandi baru"
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                    />

                    {/* SUBMIT */}
                    <div className="mt-2 md:col-span-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="btn-md"
                            loading={processing}
                        >
                            Simpan Perubahan Data
                        </Button>
                    </div>

                    {/* SUCCESS MESSAGE */}
                    {recentlySuccessful && (
                        <p className="font-body text-small text-success-dark md:col-span-2">
                            Data profil berhasil diperbarui.
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}

Edit.layout = (page) => (
    <MainLayout
        pageTitle="Perbarui Profil"
        pageDescription="Perbarui informasi dan foto profil kamu di NuraLoka."
        content={page}
    />
);
