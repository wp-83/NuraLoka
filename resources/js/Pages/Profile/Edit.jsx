import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import MainLayout from '@js/Layouts/MainLayout';
import { useTranslation } from '@js/i18n';

import {
    FiArrowLeft,
    FiUpload,
} from 'react-icons/fi';

export default function Edit({ user, provinces }) {
    const { t } = useTranslation();
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
            label: t('profile.gender_male'),
        },
        {
            value: 'female',
            label: t('profile.gender_female'),
        },
        {
            value: 'unspecified',
            label: t('profile.gender_unspecified'),
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
                {t('profile.edit_title')}
            </h1>

            {/* BACK BUTTON */}
            <div className="mt-5">
                <Link href={route('profile.index')}>
                    <Button
                        variant="primary"
                        size="btn-md"
                        iconLeft={<FiArrowLeft />}
                    >
                        {t('common.back')}
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
                        {t('profile.photo_label')}
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
                                <span>{t('profile.change_photo')}</span>
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
                        {t('profile.photo_hint')}
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
                        label={t('profile.fullname')}
                        name="fullname"
                        type="text"
                        value={data.fullname}
                        onChange={(event) =>
                            setData('fullname', event.target.value)
                        }
                        placeholder={t('profile.fullname_placeholder')}
                        error={errors.fullname}
                        autoComplete="name"
                        required
                    />

                    {/* USERNAME */}
                    <Input
                        label={t('profile.username')}
                        name="username"
                        type="text"
                        value={data.username}
                        onChange={(event) =>
                            setData('username', event.target.value)
                        }
                        placeholder={t('profile.username_placeholder')}
                        error={errors.username}
                        autoComplete="username"
                        required
                    />

                    {/* EMAIL */}
                    <Input
                        label={t('profile.email')}
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        placeholder={t('profile.email_placeholder')}
                        error={errors.email}
                        autoComplete="email"
                        required
                    />

                    {/* DATE OF BIRTH */}
                    <Input
                        label={t('profile.dob')}
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
                        label={t('profile.gender')}
                        name="gender"
                        value={data.gender}
                        onChange={(event) =>
                            setData('gender', event.target.value)
                        }
                        options={genderOptions}
                        placeholder={t('profile.gender_placeholder')}
                        error={errors.gender}
                        required
                    />

                    {/* PROVINCE */}
                    <Dropdown
                        label={t('profile.province')}
                        name="province_id"
                        value={data.province_id}
                        onChange={(event) =>
                            setData('province_id', event.target.value)
                        }
                        options={provinceOptions}
                        placeholder={t('profile.province_placeholder')}
                        error={errors.province_id}
                        required
                    />

                    {/* PASSWORD */}
                    <Input
                        label={t('profile.password_new')}
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        placeholder={t('profile.password_new_placeholder')}
                        error={errors.password}
                        autoComplete="new-password"
                    />

                    {/* PASSWORD CONFIRMATION */}
                    <Input
                        label={t('profile.password_confirm')}
                        name="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData(
                                'password_confirmation',
                                event.target.value
                            )
                        }
                        placeholder={t('profile.password_confirm_placeholder')}
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
                            {t('profile.submit')}
                        </Button>
                    </div>

                    {/* SUCCESS MESSAGE */}
                    {recentlySuccessful && (
                        <p className="font-body text-small text-success-dark md:col-span-2">
                            {t('profile.success')}
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}

Edit.layout = (page) => (
    <MainLayout
        pageTitle="title.profile_edit"
        pageDescription="Perbarui informasi dan foto profil kamu di NuraLoka."
        content={page}
    />
);
