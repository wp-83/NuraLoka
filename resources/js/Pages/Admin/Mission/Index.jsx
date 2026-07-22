import BrandText from '@components/Common/BrandText';
import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Pagination from '@components/Common/Pagination';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { mediaUrl } from '@js/mediaUrl';
import { useTranslation } from '@js/i18n';

import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiEdit2,
    FiPlus,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';
import { FaMedal } from 'react-icons/fa';

export default function Index({ missions, filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('admin.missions.index'),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleReset = () => {
        setSearch('');

        router.get(
            route('admin.missions.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.missions.destroy', deleteTarget.slug), {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.missions.page_title')}
                description={<BrandText text={t('admin.missions.page_description')} />}
            />

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                    <Input
                        label={t('admin.missions.filter_search_label')}
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.missions.filter_search_placeholder')}
                        icon={<FiSearch size={20} />}
                    />

                    <div className="flex shrink-0 gap-3">
                        <Button type="button" variant="white" onClick={handleReset}>
                            {t('admin.common.reset')}
                        </Button>

                        <Button type="submit">{t('admin.common.search')}</Button>
                    </div>
                </form>
            </div>

            {/* Add Mission */}
            <div className="flex justify-end">
                <Button
                    iconLeft={<FiPlus size={18} />}
                    onClick={() => router.get(route('admin.missions.create'))}
                >
                    {t('admin.missions.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-72 whitespace-nowrap px-5 py-4">
                                    {t('admin.missions.th_title')}
                                </th>
                                <th className="min-w-48 whitespace-nowrap px-5 py-4">
                                    {t('admin.missions.th_badge')}
                                </th>
                                <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                    {t('admin.missions.th_points')}
                                </th>
                                <th className="min-w-36 whitespace-nowrap px-5 py-4">
                                    {t('admin.missions.th_participants')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.missions.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {missions.data && missions.data.length > 0 ? (
                                missions.data.map((mission) => (
                                    <tr
                                        key={mission.id}
                                        className="border-b border-gray-20 transition-colors last:border-b-0 hover:bg-primary-10"
                                    >
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            <p className="font-heading text-body text-primary-100">
                                                {mission.title}
                                            </p>

                                            <p className="mt-1 font-body text-small text-gray-70">
                                                {mission.description.length > 50
                                                    ? `${mission.description.substring(0, 50)}...`
                                                    : mission.description}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {mission.badge ? (
                                                <div className="flex items-center gap-2">
                                                    {mission.badge.icon_path ? (
                                                        <img
                                                            src={mediaUrl(mission.badge.icon_path)}
                                                            alt={mission.badge.name}
                                                            className="h-6 w-6 object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <FaMedal className="text-primary-50" />
                                                    )}

                                                    <span className="font-medium text-gray-85">
                                                        {mission.badge.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="italic text-gray-50">
                                                    {t('admin.missions.badge_none')}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-accent-10 px-3 py-1 font-body text-small font-semibold text-accent-100">
                                                {t('admin.missions.points_value', {
                                                    points: mission.points_reward,
                                                })}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={[
                                                    'inline-flex items-center rounded-full px-3 py-1 font-body text-small font-semibold',
                                                    mission.users_count > 0
                                                        ? 'bg-success-light text-success-dark'
                                                        : 'bg-gray-10 text-gray-50',
                                                ].join(' ')}
                                            >
                                                {t('admin.missions.participants_value', {
                                                    count: mission.users_count,
                                                })}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="info"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiEdit2 size={17} />}
                                                    onClick={() =>
                                                        router.get(
                                                            route('admin.missions.edit', mission.slug),
                                                        )
                                                    }
                                                    title={t('admin.missions.action_edit')}
                                                    aria-label={t('admin.missions.action_edit')}
                                                />

                                                <Button
                                                    variant={
                                                        mission.users_count > 0 ? 'inactive' : 'error'
                                                    }
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiTrash2 size={17} />}
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            slug: mission.slug,
                                                            title: mission.title,
                                                        })
                                                    }
                                                    disabled={mission.users_count > 0}
                                                    title={
                                                        mission.users_count > 0
                                                            ? t('admin.missions.action_delete_blocked')
                                                            : t('admin.missions.action_delete')
                                                    }
                                                    aria-label={t('admin.missions.action_delete')}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8">
                                        <EmptyState
                                            title={t('admin.missions.empty_title')}
                                            description={
                                                search
                                                    ? t('admin.missions.empty_description')
                                                    : t('admin.missions.empty_description_no_search')
                                            }
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
                    links={missions.links}
                    from={missions.from}
                    to={missions.to}
                    total={missions.total}
                    itemLabel={t('admin.missions.item_label')}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={t('admin.missions.modal_delete_title')}
                actions={[
                    {
                        label: t('admin.common.cancel'),
                        variant: 'white',
                        onClick: () => setDeleteTarget(null),
                        disabled: deleting,
                    },
                    {
                        label: t('admin.common.delete'),
                        variant: 'error',
                        onClick: confirmDelete,
                        loading: deleting,
                    },
                ]}
            >
                {t('admin.missions.modal_delete_message', {
                    title: deleteTarget?.title,
                })}
            </Modal>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="title.admin_missions" content={page} />
);
