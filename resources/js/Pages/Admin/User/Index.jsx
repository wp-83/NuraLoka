import BrandText from '@components/Common/BrandText';
import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Pagination from '@components/Common/Pagination';
import UserStatisticCard from '@components/Features/UserStatisticCard';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiEdit2,
    FiSearch,
    FiShield,
    FiSlash,
    FiTrash2,
    FiUnlock,
    FiUserCheck,
    FiUsers,
} from 'react-icons/fi';

export default function Index({
    users,
    filters = {},
    statistics = {},
}) {
    const { t } = useTranslation();
    const authUser = usePage().props.auth.user;

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [role, setRole] = useState(
        filters.role ?? '',
    );

    const [gender, setGender] = useState(
        filters.gender ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [modal, setModal] = useState({
        isOpen: false,
        action: null,
        user: null,
    });

    const [processing, setProcessing] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = (e) => {
        e.preventDefault();

        router.get(
            route('admin.users.index'),
            {
                search,
                role,
                gender,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setGender('');
        setStatus('');

        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Modal
    |--------------------------------------------------------------------------
    */

    const openModal = (action, user) => {
        setModal({
            isOpen: true,
            action,
            user,
        });
    };

    const resetModal = () => {
        setModal({
            isOpen: false,
            action: null,
            user: null,
        });
    };

    const closeModal = () => {
        if (processing) {
            return;
        }

        resetModal();
    };

    /*
    |--------------------------------------------------------------------------
    | User Actions
    |--------------------------------------------------------------------------
    */

    const handleConfirm = () => {
        if (
            !modal.action ||
            !modal.user ||
            processing
        ) {
            return;
        }

        setProcessing(true);

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                resetModal();
            },

            onFinish: () => {
                setProcessing(false);
            },
        };

        if (modal.action === 'ban') {
            router.patch(
                route(
                    'admin.users.ban',
                    modal.user.id,
                ),
                {},
                options,
            );

            return;
        }

        if (modal.action === 'unban') {
            router.patch(
                route(
                    'admin.users.unban',
                    modal.user.id,
                ),
                {},
                options,
            );

            return;
        }

        if (modal.action === 'delete') {
            router.delete(
                route(
                    'admin.users.destroy',
                    modal.user.id,
                ),
                options,
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Modal Configuration
    |--------------------------------------------------------------------------
    */

    const modalConfig = {
        ban: {
            type: 'warning',
            title: t('admin.users.modal_ban_title'),
            message: t('admin.users.modal_ban_message', {
                username: modal.user?.username,
            }),
            confirmLabel: t('admin.users.modal_ban_confirm'),
            confirmVariant: 'warning',
        },

        unban: {
            type: 'success',
            title: t('admin.users.modal_unban_title'),
            message: t('admin.users.modal_unban_message', {
                username: modal.user?.username,
            }),
            confirmLabel: t('admin.users.modal_unban_confirm'),
            confirmVariant: 'success',
        },

        delete: {
            type: 'error',
            title: t('admin.users.modal_delete_title'),
            message: t('admin.users.modal_delete_message', {
                username: modal.user?.username,
            }),
            confirmLabel: t('admin.users.modal_delete_confirm'),
            confirmVariant: 'error',
        },
    };

    const activeModal =
        modalConfig[modal.action];

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const getGenderLabel = (gender) => {
        const labels = {
            male: t('admin.users.gender_male'),
            female: t('admin.users.gender_female'),
            unspecified: t('admin.users.gender_unspecified'),
        };

        return labels[gender] ?? '-';
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.users.page_title')}
                description={<BrandText text={t('admin.users.page_description')} />}
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <UserStatisticCard
                    title={t('admin.users.stat_total')}
                    value={
                        statistics.total_users ?? 0
                    }
                    icon={
                        <FiUsers size={24} />
                    }
                />

                <UserStatisticCard
                    title={t('admin.users.stat_regular')}
                    variant="green"
                    value={
                        statistics.total_regular_users ??
                        0
                    }
                    icon={
                        <FiUserCheck size={24} />
                    }
                />

                <UserStatisticCard
                    title={t('admin.users.stat_admin')}
                    variant="yellow"
                    value={
                        statistics.total_admins ?? 0
                    }
                    icon={
                        <FiShield size={24} />
                    }
                />

                <UserStatisticCard
                    title={t('admin.users.stat_banned')}
                    variant="red"
                    value={
                        statistics.total_banned_users ??
                        0
                    }
                    icon={
                        <FiSlash size={24} />
                    }
                />
            </div>

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleFilter}
                    className="flex flex-col gap-4"
                >
                    <Input
                        label={t('admin.users.filter_search_label')}
                        name="search"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder={t('admin.users.filter_search_placeholder')}
                        icon={
                            <FiSearch size={20} />
                        }
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Dropdown
                            label={t('admin.users.filter_role_label')}
                            name="role"
                            value={role}
                            onChange={(e) =>
                                setRole(
                                    e.target.value,
                                )
                            }
                            placeholder={t('admin.users.filter_role_placeholder')}
                            options={[
                                {
                                    value: 'admin',
                                    label: t('admin.users.role_admin'),
                                },
                                {
                                    value: 'user',
                                    label: t('admin.users.role_user'),
                                },
                            ]}
                        />

                        <Dropdown
                            label={t('admin.users.filter_gender_label')}
                            name="gender"
                            value={gender}
                            onChange={(e) =>
                                setGender(
                                    e.target.value,
                                )
                            }
                            placeholder={t('admin.users.filter_gender_placeholder')}
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
                        />

                        <Dropdown
                            label={t('admin.users.filter_status_label')}
                            name="status"
                            value={status}
                            onChange={(e) =>
                                setStatus(
                                    e.target.value,
                                )
                            }
                            placeholder={t('admin.users.filter_status_placeholder')}
                            options={[
                                {
                                    value: 'active',
                                    label: t('admin.users.status_active'),
                                },
                                {
                                    value: 'banned',
                                    label: t('admin.users.status_banned'),
                                },
                            ]}
                        />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            type="button"
                            variant="white"
                            onClick={handleReset}
                        >
                            {t('admin.common.reset')}
                        </Button>

                        <Button type="submit">
                            {t('admin.common.apply_filter')}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Add User */}
            <div className="flex justify-end">
                <Button
                    onClick={() =>
                        router.get(
                            route(
                                'admin.users.create',
                            ),
                        )
                    }
                >
                    {t('admin.users.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-72 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_user')}
                                </th>

                                <th className="min-w-48 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_username')}
                                </th>

                                <th className="min-w-68 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_email')}
                                </th>

                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_gender')}
                                </th>

                                <th className="min-w-44 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_province')}
                                </th>

                                <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_points')}
                                </th>

                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_role')}
                                </th>

                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_status')}
                                </th>

                                <th className="min-w-40 whitespace-nowrap px-5 py-4">
                                    {t('admin.users.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => {
                                    const isActionDisabled =
                                        user.id == authUser.id ||
                                        user.is_admin;

                                    return (
                                        <tr
                                            key={user.id}
                                            className={`
                                                border-b
                                                border-gray-20
                                                transition-colors
                                                last:border-b-0
                                                ${
                                                    user.id == authUser.id
                                                        ? 'bg-accent-10'
                                                        : 'hover:bg-primary-10'
                                                }
                                            `}
                                        >
                                            {/* User */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            user.public_profile_photo
                                                        }
                                                        alt={user.username}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />

                                                    <div>
                                                        <p className="font-heading text-body text-gray-100">
                                                            {user.user_detail
                                                                ?.fullname ?? '-'}

                                                            {user.id ==
                                                                authUser.id && (
                                                                <span className="font-bold text-small text-primary-70">
                                                                    {' '}
                                                                    {t('admin.users.you_suffix')}
                                                                </span>
                                                            )}
                                                        </p>

                                                        <p className="font-body text-small text-gray-50">
                                                            {t('admin.users.id_prefix')}: {user.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Username */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                @{user.username}
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                {user.email}
                                            </td>

                                            {/* Gender */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                {getGenderLabel(
                                                    user.user_detail?.gender,
                                                )}
                                            </td>

                                            {/* Province */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                {user.user_detail
                                                    ?.province?.name ?? '-'}
                                            </td>

                                            {/* Points */}
                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                {(
                                                    user.user_detail
                                                        ?.total_points ?? 0
                                                ).toLocaleString('id-ID')}
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4 text-center font-body text-body text-gray-100">
                                                <span
                                                    className={[
                                                        'inline-flex rounded-md px-3 py-1 font-body text-small',
                                                        user.is_admin
                                                            ? 'bg-secondary-100 text-secondary-10'
                                                            : 'bg-accent-100 text-accent-10',
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                >
                                                    {user.is_admin
                                                        ? t('admin.users.role_admin')
                                                        : t('admin.users.role_user')}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 text-center font-body text-body text-gray-100">
                                                <span
                                                    className={[
                                                        'inline-flex rounded-md px-3 py-1 font-body text-small',
                                                        user.is_banned
                                                            ? 'bg-error-dark text-error-light'
                                                            : 'bg-success-dark text-success-light',
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                >
                                                    {user.is_banned
                                                        ? t('admin.users.status_banned')
                                                        : t('admin.users.status_active')}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Edit */}
                                                    <Button
                                                        variant="info"
                                                        size="btn-sm"
                                                        className="h-9 w-9 p-0"
                                                        iconLeft={
                                                            <FiEdit2
                                                                size={17}
                                                            />
                                                        }
                                                        onClick={() =>
                                                            router.get(
                                                                route(
                                                                    'admin.users.edit',
                                                                    user.id,
                                                                ),
                                                            )
                                                        }
                                                        title={t('admin.users.action_edit')}
                                                        aria-label={t('admin.users.action_edit')}
                                                    />

                                                    {/* Ban / Unban */}
                                                    {user.is_banned ? (
                                                        <Button
                                                            variant={
                                                                isActionDisabled
                                                                    ? 'inactive'
                                                                    : 'success'
                                                            }
                                                            size="btn-sm"
                                                            className="h-9 w-9 p-0"
                                                            iconLeft={
                                                                <FiUnlock
                                                                    size={17}
                                                                />
                                                            }
                                                            onClick={() =>
                                                                openModal(
                                                                    'unban',
                                                                    user,
                                                                )
                                                            }
                                                            disabled={
                                                                isActionDisabled
                                                            }
                                                            title={
                                                                user.id ==
                                                                authUser.id
                                                                    ? t('admin.users.action_disabled_self_unban')
                                                                    : user.is_admin
                                                                    ? t('admin.users.action_disabled_admin_ban')
                                                                    : t('admin.users.action_unban')
                                                            }
                                                            aria-label={t('admin.users.action_unban')}
                                                        />
                                                    ) : (
                                                        <Button
                                                            variant={
                                                                isActionDisabled
                                                                    ? 'inactive'
                                                                    : 'warning'
                                                            }
                                                            size="btn-sm"
                                                            className="h-9 w-9 p-0"
                                                            iconLeft={
                                                                <FiSlash
                                                                    size={17}
                                                                />
                                                            }
                                                            onClick={() =>
                                                                openModal(
                                                                    'ban',
                                                                    user,
                                                                )
                                                            }
                                                            disabled={
                                                                isActionDisabled
                                                            }
                                                            title={
                                                                user.id ==
                                                                authUser.id
                                                                    ? t('admin.users.action_disabled_self_ban')
                                                                    : user.is_admin
                                                                    ? t('admin.users.action_disabled_admin_ban')
                                                                    : t('admin.users.action_ban')
                                                            }
                                                            aria-label={t('admin.users.action_ban')}
                                                        />
                                                    )}

                                                    {/* Delete */}
                                                    <Button
                                                        variant={
                                                            isActionDisabled
                                                                ? 'inactive'
                                                                : 'error'
                                                        }
                                                        size="btn-sm"
                                                        className="h-9 w-9 p-0"
                                                        iconLeft={
                                                            <FiTrash2
                                                                size={17}
                                                            />
                                                        }
                                                        onClick={() =>
                                                            openModal(
                                                                'delete',
                                                                user,
                                                            )
                                                        }
                                                        disabled={
                                                            isActionDisabled
                                                        }
                                                        title={
                                                            user.id ==
                                                            authUser.id
                                                                ? t('admin.users.action_disabled_self_delete')
                                                                : user.is_admin
                                                                ? t('admin.users.action_disabled_admin_delete')
                                                                : t('admin.users.action_delete')
                                                        }
                                                        aria-label={t('admin.users.action_delete')}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-8"
                                    >
                                        <EmptyState
                                            title={t('admin.users.empty_title')}
                                            description={t('admin.users.empty_description')}
                                            size="compact"
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    links={users.links}
                    from={users.from}
                    to={users.to}
                    total={users.total}
                    itemLabel={t('admin.users.item_label')}
                />
            </div>

            {/* Confirmation Modal */}
            {activeModal && (
                <Modal
                    isOpen={modal.isOpen}
                    onClose={closeModal}
                    type={activeModal.type}
                    title={activeModal.title}
                    actions={[
                        {
                            label: t('admin.common.cancel'),
                            variant: 'white',
                            onClick: closeModal,
                            disabled: processing,
                        },
                        {
                            label:
                                activeModal.confirmLabel,
                            variant:
                                activeModal.confirmVariant,
                            onClick: handleConfirm,
                            loading: processing,
                            disabled: processing,
                        },
                    ]}
                >
                    {activeModal.message}
                </Modal>
            )}
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout
        pageTitle="title.admin_users"
        content={page}
    />
);
