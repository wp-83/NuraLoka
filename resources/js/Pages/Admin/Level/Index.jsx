import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router } from '@inertiajs/react';
import { useState } from 'react';

import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Index({ levels = [] }) {
    const { t } = useTranslation();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.levels.destroy', deleteTarget.slug), {
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
                title={t('admin.levels.page_title')}
                description={t('admin.levels.page_description')}
            />

            {/* Add Level */}
            <div className="flex justify-end">
                <Button
                    iconLeft={<FiPlus size={18} />}
                    onClick={() => router.get(route('admin.levels.create'))}
                >
                    {t('admin.levels.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    {t('admin.levels.th_order')}
                                </th>
                                <th className="min-w-56 whitespace-nowrap px-5 py-4">
                                    {t('admin.levels.th_name')}
                                </th>
                                <th className="min-w-44 whitespace-nowrap px-5 py-4">
                                    {t('admin.levels.th_min_points')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.levels.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {levels.length > 0 ? (
                                levels.map((lvl) => (
                                    <tr
                                        key={lvl.id}
                                        className="border-b border-gray-20 transition-colors last:border-b-0 hover:bg-primary-10"
                                    >
                                        <td className="px-5 py-4 text-center font-body text-body font-semibold text-primary-100">
                                            #{lvl.order}
                                        </td>

                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {lvl.name}
                                        </td>

                                        <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                            {t('admin.levels.min_points_value', {
                                                points: Number(lvl.min_points).toLocaleString('id-ID'),
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
                                                        router.get(route('admin.levels.edit', lvl.slug))
                                                    }
                                                    title={t('admin.levels.action_edit')}
                                                    aria-label={t('admin.levels.action_edit')}
                                                />

                                                <Button
                                                    variant="error"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiTrash2 size={17} />}
                                                    onClick={() =>
                                                        setDeleteTarget({ slug: lvl.slug, name: lvl.name })
                                                    }
                                                    title={t('admin.levels.action_delete')}
                                                    aria-label={t('admin.levels.action_delete')}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8">
                                        <EmptyState
                                            title={t('admin.levels.empty_title')}
                                            description={t('admin.levels.empty_description')}
                                            size="compact"
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={t('admin.levels.modal_delete_title')}
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
                {t('admin.levels.modal_delete_message', {
                    name: deleteTarget?.name,
                })}
            </Modal>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="title.admin_levels" content={page} />
);
