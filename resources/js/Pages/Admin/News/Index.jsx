import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Pagination from '@components/Common/Pagination';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiEdit2,
    FiPlus,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';

export default function Index({ news, filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Format the publish date as a readable Indonesian string.
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('admin.news.index'),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleReset = () => {
        setSearch('');

        router.get(
            route('admin.news.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.news.destroy', deleteTarget.slug), {
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
                title={t('admin.news.page_title')}
                description={t('admin.news.page_description')}
            />

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                    <Input
                        label={t('admin.news.filter_search_label')}
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.news.filter_search_placeholder')}
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

            {/* Add News */}
            <div className="flex justify-end">
                <Button
                    iconLeft={<FiPlus size={18} />}
                    onClick={() => router.get(route('admin.news.create'))}
                >
                    {t('admin.news.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    {t('admin.news.th_image')}
                                </th>
                                <th className="min-w-72 whitespace-nowrap px-5 py-4">
                                    {t('admin.news.th_title')}
                                </th>
                                <th className="min-w-40 whitespace-nowrap px-5 py-4">
                                    {t('admin.news.th_author')}
                                </th>
                                <th className="min-w-48 whitespace-nowrap px-5 py-4">
                                    {t('admin.news.th_publish_date')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.news.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {news.data && news.data.length > 0 ? (
                                news.data.map((item) => {
                                    const authorName =
                                        item.user?.user_details?.fullname ||
                                        item.user?.username ||
                                        t('admin.news.author_fallback');

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-20 transition-colors last:border-b-0 hover:bg-primary-10"
                                        >
                                            <td className="px-5 py-4">
                                                <img
                                                    src={item.thumbnail || '/images/defaults/image.png'}
                                                    alt={item.title}
                                                    className="h-14 w-20 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/images/defaults/image.png';
                                                    }}
                                                />
                                            </td>

                                            <td className="px-5 py-4 font-body text-body font-semibold text-primary-100">
                                                {item.title}
                                            </td>

                                            <td className="px-5 py-4 font-body text-body text-gray-100">
                                                {authorName}
                                            </td>

                                            <td className="px-5 py-4 font-body text-small text-gray-70">
                                                {formatDate(item.publish_date)}
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
                                                                route('admin.news.edit', item.slug),
                                                            )
                                                        }
                                                        title={t('admin.news.action_edit')}
                                                        aria-label={t('admin.news.action_edit')}
                                                    />

                                                    <Button
                                                        variant="error"
                                                        size="btn-sm"
                                                        className="h-9 w-9 p-0"
                                                        iconLeft={<FiTrash2 size={17} />}
                                                        onClick={() =>
                                                            setDeleteTarget({
                                                                slug: item.slug,
                                                                title: item.title,
                                                            })
                                                        }
                                                        title={t('admin.news.action_delete')}
                                                        aria-label={t('admin.news.action_delete')}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8">
                                        <EmptyState
                                            title={t('admin.news.empty_title')}
                                            description={
                                                search
                                                    ? t('admin.news.empty_description')
                                                    : t('admin.news.empty_description_no_search')
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
                    links={news.links}
                    from={news.from}
                    to={news.to}
                    total={news.total}
                    itemLabel={t('admin.news.item_label')}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={t('admin.news.modal_delete_title')}
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
                {t('admin.news.modal_delete_message', {
                    title: deleteTarget?.title,
                })}
            </Modal>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="title.admin_news" content={page} />
);
