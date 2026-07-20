import EmptyState from '@components/Common/EmptyState';
import Modal from '@components/Common/Modal';
import PageHeader from '@components/Common/PageHeader';
import Pagination from '@components/Common/Pagination';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiEdit2,
    FiMapPin,
    FiPlus,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';

export default function Index({ places, filters = {} }) {
    const { t } = useTranslation();

    const SOURCE_OPTIONS = [
        { value: 'internal', label: t('admin.places.source_internal') },
        { value: 'osm', label: t('admin.places.source_osm') },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [source, setSource] = useState(filters.source ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (overrides = {}) => {
        const params = { search, source, ...overrides };

        // Drop empty params so the URL stays clean.
        Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);

        router.get(route('admin.places.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleReset = () => {
        setSearch('');
        setSource('');

        router.get(
            route('admin.places.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.places.destroy', deleteTarget.slug), {
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
                title={t('admin.places.page_title')}
                description={t('admin.places.page_description')}
            />

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <Input
                        label={t('admin.places.filter_search_label')}
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.places.filter_search_placeholder')}
                        icon={<FiSearch size={20} />}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Dropdown
                            label={t('admin.places.filter_source_label')}
                            name="source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder={t('admin.places.filter_source_placeholder')}
                            options={SOURCE_OPTIONS}
                        />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button type="button" variant="white" onClick={handleReset}>
                            {t('admin.common.reset')}
                        </Button>

                        <Button type="submit">{t('admin.common.apply_filter')}</Button>
                    </div>
                </form>
            </div>

            {/* Add Place */}
            <div className="flex justify-end">
                <Button
                    iconLeft={<FiPlus size={18} />}
                    onClick={() => router.get(route('admin.places.create'))}
                >
                    {t('admin.places.add_button')}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className="text-center">
                                <th className="min-w-56 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_name')}
                                </th>
                                <th className="min-w-56 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_address')}
                                </th>
                                <th className="min-w-40 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_coordinates')}
                                </th>
                                <th className="min-w-44 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_categories')}
                                </th>
                                <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_source')}
                                </th>
                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    {t('admin.places.th_actions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {places.data && places.data.length > 0 ? (
                                places.data.map((place) => (
                                    <tr
                                        key={place.id}
                                        className="border-b border-gray-20 align-top transition-colors last:border-b-0 hover:bg-primary-10"
                                    >
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            <span className="flex items-center gap-2 font-semibold text-primary-100">
                                                <FiMapPin className="shrink-0 text-error-dark" />
                                                {place.name}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 font-body text-small text-gray-70">
                                            {place.address || (
                                                <span className="italic text-gray-50">
                                                    {t('admin.places.address_unavailable')}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-block rounded-md bg-gray-10 px-2 py-1 font-body text-micro text-gray-70">
                                                {parseFloat(place.latitude).toFixed(5)},{' '}
                                                {parseFloat(place.longitude).toFixed(5)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {place.categories && place.categories.length > 0 ? (
                                                    place.categories.map((cat) => (
                                                        <span
                                                            key={cat.id}
                                                            className="inline-flex rounded-full bg-secondary-10 px-2.5 py-1 font-body text-micro font-semibold text-secondary-100"
                                                        >
                                                            {cat.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-10 px-2.5 py-1 font-body text-micro italic text-gray-50">
                                                        {t('admin.places.no_categories')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            {place.source === 'osm' ? (
                                                <span className="inline-flex rounded-full bg-info-light px-2.5 py-1 font-body text-micro font-semibold text-info-dark">
                                                    {t('admin.places.source_badge_osm')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-secondary-10 px-2.5 py-1 font-body text-micro font-semibold text-secondary-100">
                                                    {t('admin.places.source_badge_internal')}
                                                </span>
                                            )}
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
                                                            route('admin.places.edit', place.slug),
                                                        )
                                                    }
                                                    title={t('admin.places.action_edit')}
                                                    aria-label={t('admin.places.action_edit')}
                                                />

                                                <Button
                                                    variant="error"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={<FiTrash2 size={17} />}
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            slug: place.slug,
                                                            name: place.name,
                                                        })
                                                    }
                                                    title={t('admin.places.action_delete')}
                                                    aria-label={t('admin.places.action_delete')}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8">
                                        <EmptyState
                                            title={t('admin.places.empty_title')}
                                            description={
                                                search
                                                    ? t('admin.places.empty_description')
                                                    : t('admin.places.empty_description_no_search')
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    links={places.links}
                    from={places.from}
                    to={places.to}
                    total={places.total}
                    itemLabel={t('admin.places.item_label')}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={t('admin.places.modal_delete_title')}
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
                {t('admin.places.modal_delete_message', {
                    name: deleteTarget?.name,
                })}
            </Modal>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="Kelola Destinasi" content={page} />
);
