import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Pagination from '@components/Common/Pagination';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';
import { mediaUrl } from '@js/mediaUrl';

import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiEdit2,
    FiPlus,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';
import { FaMedal } from 'react-icons/fa';

export default function Index({ badges, filters = {} }) {
    const { t } = useTranslation();

    const TIER = [
        t('admin.badges.tier_none'),
        t('admin.badges.tier_bronze'),
        t('admin.badges.tier_silver'),
        t('admin.badges.tier_gold'),
        t('admin.badges.tier_diamond'),
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('admin.badges.index'),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleReset = () => {
        setSearch('');

        router.get(
            route('admin.badges.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.badges.destroy', deleteTarget.slug), {
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
                title={t('admin.badges.page_title')}
                description={t('admin.badges.page_description')}
            />

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                    <Input
                        label={t('admin.badges.filter_search_label')}
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.badges.filter_search_placeholder')}
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

            {/* Add Badge */}
            <div className="flex justify-end">
                <Button
                    iconLeft={<FiPlus size={18} />}
                    onClick={() => router.get(route('admin.badges.create'))}
                >
                    {t('admin.badges.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-72 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_badge')}
                                </th>
                                <th className="min-w-44 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_type')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_tier')}
                                </th>
                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_points')}
                                </th>
                                <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_used')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.badges.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {badges.data && badges.data.length > 0 ? (
                                badges.data.map((badge) => (
                                    <tr
                                        key={badge.id}
                                        className="border-b border-gray-20 transition-colors last:border-b-0 hover:bg-primary-10"
                                    >
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            <div className="flex items-center gap-3">
                                                {badge.icon_path ? (
                                                    <img
                                                        src={mediaUrl(badge.icon_path)}
                                                        alt={badge.name}
                                                        className="h-11 w-11 shrink-0 object-contain"
                                                    />
                                                ) : (
                                                    <FaMedal className="h-11 w-11 shrink-0 text-gray-30" />
                                                )}

                                                <div>
                                                    <p className="font-heading text-body text-gray-100">
                                                        {badge.name}
                                                    </p>

                                                    {badge.requirement_description && (
                                                        <p className="max-w-xs truncate font-body text-small text-gray-50">
                                                            {badge.requirement_description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-center font-body text-body text-gray-100">
                                            <span
                                                className={[
                                                    'inline-flex rounded-md px-3 py-1 font-body text-small',
                                                    badge.type === 'special'
                                                        ? 'bg-info-light text-info-dark'
                                                        : 'bg-secondary-10 text-secondary-100',
                                                ].join(' ')}
                                            >
                                                {badge.type === 'special'
                                                    ? t('admin.badges.type_special')
                                                    : t('admin.badges.type_general')}
                                            </span>

                                            <div className="mt-1 font-body text-micro text-gray-70">
                                                {badge.category || '-'}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                            {TIER[badge.tier_level] || badge.tier_level}
                                            {badge.tier_target > 0 && (
                                                <span className="text-gray-50">
                                                    {' '}
                                                    ·{' '}
                                                    {t('admin.badges.tier_target', {
                                                        target: badge.tier_target,
                                                    })}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-center font-body text-small font-semibold text-primary-100">
                                            {badge.points}
                                        </td>

                                        <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                            {t('admin.badges.used_count', {
                                                count: badge.missions_count,
                                            })}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="info"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiEdit2 size={17} />}
                                                    onClick={() =>
                                                        router.get(route('admin.badges.edit', badge.slug))
                                                    }
                                                    title={t('admin.badges.action_edit')}
                                                    aria-label={t('admin.badges.action_edit')}
                                                />

                                                <Button
                                                    variant="error"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiTrash2 size={17} />}
                                                    onClick={() =>
                                                        setDeleteTarget({ slug: badge.slug, name: badge.name })
                                                    }
                                                    title={t('admin.badges.action_delete')}
                                                    aria-label={t('admin.badges.action_delete')}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8">
                                        <EmptyState
                                            title={t('admin.badges.empty_title')}
                                            description={
                                                search
                                                    ? t('admin.badges.empty_description')
                                                    : t('admin.badges.empty_description_no_search')
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
                    links={badges.links}
                    from={badges.from}
                    to={badges.to}
                    total={badges.total}
                    itemLabel={t('admin.badges.item_label')}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={t('admin.badges.modal_delete_title')}
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
                {t('admin.badges.modal_delete_message', {
                    name: deleteTarget?.name,
                })}
            </Modal>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="title.admin_badges" content={page} />
);
