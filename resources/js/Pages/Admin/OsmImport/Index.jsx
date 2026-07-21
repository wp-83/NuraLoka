import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import {
    FiDownload,
    FiGlobe,
    FiInfo,
    FiMap,
} from 'react-icons/fi';

function formatTime(value) {
    if (!value) return '—';

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Index({ regions = [], runs = [], osmTotal = 0 }) {
    const { t } = useTranslation();
    const { errors = {} } = usePage().props;

    const STATUS_META = {
        pending: { label: t('admin.osm_import.status_pending'), cls: 'bg-gray-10 text-gray-70' },
        running: { label: t('admin.osm_import.status_running'), cls: 'bg-info-light text-info-dark animate-pulse' },
        success: { label: t('admin.osm_import.status_success'), cls: 'bg-success-light text-success-dark' },
        failed: { label: t('admin.osm_import.status_failed'), cls: 'bg-error-light text-error-dark' },
    };

    const StatusBadge = ({ status }) => {
        const meta = STATUS_META[status] || STATUS_META.pending;

        return (
            <span className={`inline-flex rounded-full px-2.5 py-1 font-body text-micro font-semibold ${meta.cls}`}>
                {meta.label}
            </span>
        );
    };

    const [mode, setMode] = useState('region');
    const [region, setRegion] = useState(regions[0]?.value || 'indonesia');
    const [bbox, setBbox] = useState({ south: '', west: '', north: '', east: '' });
    const [tile, setTile] = useState('0.5');
    const [sleep, setSleep] = useState('2');
    const [submitting, setSubmitting] = useState(false);

    const hasActiveRun = runs.some((r) => r.status === 'pending' || r.status === 'running');

    // Auto-refresh the table while an import is running (light polling every 5 seconds).
    useEffect(() => {
        if (!hasActiveRun) return;

        const id = setInterval(() => {
            router.reload({ only: ['runs', 'osmTotal'] });
        }, 5000);

        return () => clearInterval(id);
    }, [hasActiveRun]);

    const submit = (e) => {
        e.preventDefault();

        router.post(
            route('admin.osm-import.store'),
            {
                mode,
                region: mode === 'region' ? region : null,
                south: mode === 'custom' ? bbox.south : null,
                west: mode === 'custom' ? bbox.west : null,
                north: mode === 'custom' ? bbox.north : null,
                east: mode === 'custom' ? bbox.east : null,
                tile,
                sleep,
            },
            {
                preserveScroll: true,
                onStart: () => setSubmitting(true),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const selectedRegion = regions.find((r) => r.value === region);
    const regionOptions = regions.map((r) => ({ value: r.value, label: r.label }));

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.osm_import.page_title')}
                description={t('admin.osm_import.page_description', {
                    total: Number(osmTotal).toLocaleString('id-ID'),
                })}
            />

            {/* Worker Notice */}
            <div className="flex items-start gap-3 rounded-xl border border-info-dark/20 bg-info-light p-4">
                <FiInfo className="mt-0.5 shrink-0 text-info-dark" />
                <p className="font-body text-small text-gray-70">
                    {t('admin.osm_import.notice')}
                </p>
            </div>

            {/* Form */}
            <FormSection
                title={t('admin.osm_import.section_title')}
                description={t('admin.osm_import.section_description')}
            >
                <form onSubmit={submit} className="flex flex-col gap-5">
                    {/* Mode switch */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={mode === 'region' ? 'primary' : 'white'}
                            iconLeft={<FiGlobe size={18} />}
                            onClick={() => setMode('region')}
                        >
                            {t('admin.osm_import.mode_region')}
                        </Button>

                        <Button
                            type="button"
                            variant={mode === 'custom' ? 'primary' : 'white'}
                            iconLeft={<FiMap size={18} />}
                            onClick={() => setMode('custom')}
                        >
                            {t('admin.osm_import.mode_custom')}
                        </Button>
                    </div>

                    {mode === 'region' ? (
                        <div>
                            <Dropdown
                                label={t('admin.osm_import.label_region')}
                                name="region"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                options={regionOptions}
                                error={errors.region}
                                required
                            />

                            {selectedRegion && (
                                <p className="mt-1 font-body text-micro text-gray-50">
                                    {t('admin.osm_import.bbox_hint', {
                                        bbox: selectedRegion.bbox.join(', '),
                                    })}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label={t('admin.osm_import.label_south')}
                                name="south"
                                type="number"
                                step="any"
                                value={bbox.south}
                                onChange={(e) => setBbox({ ...bbox, south: e.target.value })}
                                placeholder="-8.30"
                                error={errors.south}
                            />

                            <Input
                                label={t('admin.osm_import.label_north')}
                                name="north"
                                type="number"
                                step="any"
                                value={bbox.north}
                                onChange={(e) => setBbox({ ...bbox, north: e.target.value })}
                                placeholder="-6.00"
                                error={errors.north}
                            />

                            <Input
                                label={t('admin.osm_import.label_west')}
                                name="west"
                                type="number"
                                step="any"
                                value={bbox.west}
                                onChange={(e) => setBbox({ ...bbox, west: e.target.value })}
                                placeholder="108.55"
                                error={errors.west}
                            />

                            <Input
                                label={t('admin.osm_import.label_east')}
                                name="east"
                                type="number"
                                step="any"
                                value={bbox.east}
                                onChange={(e) => setBbox({ ...bbox, east: e.target.value })}
                                placeholder="111.70"
                                error={errors.east}
                            />
                        </div>
                    )}

                    {/* Advanced options */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label={t('admin.osm_import.label_tile')}
                            name="tile"
                            type="number"
                            step="any"
                            value={tile}
                            onChange={(e) => setTile(e.target.value)}
                            placeholder="0.5"
                            helperText={t('admin.osm_import.tile_hint')}
                            error={errors.tile}
                        />

                        <Input
                            label={t('admin.osm_import.label_sleep')}
                            name="sleep"
                            type="number"
                            step="any"
                            value={sleep}
                            onChange={(e) => setSleep(e.target.value)}
                            placeholder="2"
                            error={errors.sleep}
                        />
                    </div>

                    {errors.mode && (
                        <p className="font-body text-small italic text-error-dark">{errors.mode}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            iconLeft={<FiDownload size={18} />}
                            loading={submitting}
                            disabled={hasActiveRun}
                        >
                            {t('admin.osm_import.submit')}
                        </Button>

                        {hasActiveRun && (
                            <span className="font-body text-small text-gray-50">
                                {t('admin.osm_import.active_run_hint')}
                            </span>
                        )}
                    </div>
                </form>
            </FormSection>

            {/* History */}
            <div className="flex flex-col gap-3">
                <h2 className="font-heading text-subtitle font-bold text-primary-100">
                    {t('admin.osm_import.history_heading')}
                </h2>

                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-100 font-heading text-body text-white">
                                <tr className="text-center">
                                    <th className="min-w-40 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_area')}
                                    </th>
                                    <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_status')}
                                    </th>
                                    <th className="min-w-36 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_saved_points')}
                                    </th>
                                    <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_tiles')}
                                    </th>
                                    <th className="min-w-36 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_time')}
                                    </th>
                                    <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                        {t('admin.osm_import.th_by')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {runs.length > 0 ? (
                                    runs.map((run) => (
                                        <tr
                                            key={run.id}
                                            className="border-b border-gray-20 align-top last:border-b-0"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="font-body text-small font-semibold capitalize text-primary-100">
                                                    {run.region}
                                                </span>
                                                <p className="font-body text-micro text-gray-50">
                                                    {Number(run.south).toFixed(2)}, {Number(run.west).toFixed(2)} →{' '}
                                                    {Number(run.north).toFixed(2)}, {Number(run.east).toFixed(2)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge status={run.status} />

                                                {run.status === 'failed' && run.message && (
                                                    <p className="mt-1 max-w-xs font-body text-micro text-error-dark">
                                                        {run.message}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                                {Number(run.imported).toLocaleString('id-ID')}

                                                {run.places_before != null && run.places_after != null && (
                                                    <span className="block font-body text-micro text-gray-50">
                                                        {t('admin.osm_import.total_summary', {
                                                            before: Number(run.places_before).toLocaleString('id-ID'),
                                                            after: Number(run.places_after).toLocaleString('id-ID'),
                                                        })}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                                {run.total_tiles > 0 ? (
                                                    <>
                                                        <span className="block">
                                                            {t('admin.osm_import.tiles_summary', {
                                                                processed: Number(run.processed_tiles || 0).toLocaleString('id-ID'),
                                                                total: Number(run.total_tiles).toLocaleString('id-ID'),
                                                            })}
                                                        </span>

                                                        {run.status === 'running' && (
                                                            <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-gray-10">
                                                                <span
                                                                    className="block h-full rounded-full bg-info-dark transition-all"
                                                                    style={{
                                                                        width: `${Math.min(100, Math.round(((run.processed_tiles || 0) / run.total_tiles) * 100))}%`,
                                                                    }}
                                                                />
                                                            </span>
                                                        )}

                                                        {run.failed_tiles > 0 && (
                                                            <span className="mt-0.5 block font-body text-micro text-error-dark">
                                                                {t('admin.osm_import.tiles_failed', {
                                                                    count: run.failed_tiles,
                                                                })}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center font-body text-micro text-gray-70">
                                                <span className="block">
                                                    {t('admin.osm_import.started_at', {
                                                        time: formatTime(run.started_at),
                                                    })}
                                                </span>
                                                <span className="block">
                                                    {t('admin.osm_import.finished_at', {
                                                        time: formatTime(run.finished_at),
                                                    })}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-center font-body text-small text-gray-70">
                                                {run.triggered_by_name || '—'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center font-body text-body text-gray-50">
                                            {t('admin.osm_import.empty_history')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout pageTitle="title.admin_osm_import" content={page} />
);
