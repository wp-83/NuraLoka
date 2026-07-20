import FormSection from '@components/Common/FormSection';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import { useTranslation } from '@js/i18n';

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
    const { t } = useTranslation();

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
                    {t('admin.common.back')}
                </Button>
            </div>

            {/* Profile Photo */}
            <FormSection
                title={t('admin.users.form_photo_title')}
                description={t('admin.users.form_photo_description')}
            >
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    {/* Preview is only shown when a photo exists */}
                    {photoPreview && (
                        <img
                            src={photoPreview}
                            alt={t('admin.users.form_photo_title')}
                            className="h-32 w-32 rounded-full p-0.5 border-3 border-secondary object-cover"
                        />
                    )}

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

                            {photoPreview
                                ? t('admin.users.form_photo_change')
                                : t('admin.users.form_photo_choose')}
                        </label>

                        <input
                            id="profile_photo"
                            name="profile_photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) =>
                                setData(
                                    'profile_photo',
                                    e.target.files?.[0] ??
                                        null,
                                )
                            }
                        />

                        {data.profile_photo && (
                            <p className="max-w-64 truncate font-body text-small text-gray-50">
                                {data.profile_photo.name}
                            </p>
                        )}

                        {errors.profile_photo && (
                            <p className="font-body text-small italic text-error-dark">
                                {errors.profile_photo}
                            </p>
                        )}
                    </div>
                </div>
            </FormSection>

            {/* Account Information */}
            <FormSection
                title={t('admin.users.form_account_title')}
                description={t('admin.users.form_account_description')}
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label={t('admin.users.label_username')}
                        name="username"
                        value={data.username}
                        onChange={(e) =>
                            setData(
                                'username',
                                e.target.value,
                            )
                        }
                        placeholder={t('admin.users.placeholder_username')}
                        icon={
                            <FiUser size={20} />
                        }
                        error={errors.username}
                        required
                    />

                    <Input
                        label={t('admin.users.label_email')}
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData(
                                'email',
                                e.target.value,
                            )
                        }
                        placeholder={t('admin.users.placeholder_email')}
                        icon={
                            <FiMail size={20} />
                        }
                        error={errors.email}
                        required
                    />

                    <Dropdown
                        label={t('admin.users.label_role')}
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
                                label: t('admin.users.role_user'),
                            },
                            {
                                value: '1',
                                label: t('admin.users.role_admin'),
                            },
                        ]}
                        error={errors.is_admin}
                        disabled={isOwnAccount}
                        required
                    />
                </div>
            </FormSection>

            {/* Personal Information */}
            <FormSection
                title={t('admin.users.form_personal_title')}
                description={t('admin.users.form_personal_description')}
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label={t('admin.users.label_fullname')}
                        name="fullname"
                        value={data.fullname}
                        onChange={(e) =>
                            setData(
                                'fullname',
                                e.target.value,
                            )
                        }
                        placeholder={t('admin.users.placeholder_fullname')}
                        icon={
                            <FiUser size={20} />
                        }
                        error={errors.fullname}
                        required
                    />

                    <Input
                        label={t('admin.users.label_dob')}
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
                        label={t('admin.users.label_gender')}
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
                                label: t('admin.users.gender_male'),
                            },
                            {
                                value: 'female',
                                label: t('admin.users.gender_female'),
                            },
                            {
                                value: 'unspecified',
                                label: t('admin.users.gender_unspecified'),
                            },
                        ]}
                        error={errors.gender}
                        required
                    />

                    <Dropdown
                        label={t('admin.users.label_province')}
                        name="province_id"
                        value={data.province_id}
                        onChange={(e) =>
                            setData(
                                'province_id',
                                e.target.value,
                            )
                        }
                        placeholder={t('admin.users.placeholder_province')}
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
            </FormSection>

            {/* Password */}
            <FormSection
                title={
                    isEdit
                        ? t('admin.users.form_password_title_edit')
                        : t('admin.users.form_password_title')
                }
                description={
                    isEdit
                        ? t('admin.users.form_password_description_edit')
                        : t('admin.users.form_password_description')
                }
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label={
                            isEdit
                                ? t('admin.users.label_password_new')
                                : t('admin.users.label_password')
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
                        placeholder={t('admin.users.placeholder_password')}
                        icon={
                            <FiLock size={20} />
                        }
                        error={errors.password}
                        required={!isEdit}
                    />

                    <Input
                        label={t('admin.users.label_password_confirm')}
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
                        placeholder={t('admin.users.placeholder_password_confirm')}
                        icon={
                            <FiLock size={20} />
                        }
                        error={
                            errors.password_confirmation
                        }
                        required={!isEdit}
                    />
                </div>
            </FormSection>

            {/* Actions */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    loading={processing}
                    iconLeft={
                        !processing && (
                            <FiSave size={20} />
                        )
                    }
                >
                    {isEdit
                        ? t('admin.users.submit_edit')
                        : t('admin.users.submit_create')}
                </Button>
            </div>
        </form>
    );
}
