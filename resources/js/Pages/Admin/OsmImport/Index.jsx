import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaDownload, FaGlobeAsia, FaMapMarkedAlt, FaInfoCircle } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

const STATUS_META = {
    pending: { label: 'Menunggu', cls: 'bg-gray-10 text-gray-70' },
    running: { label: 'Berjalan', cls: 'bg-info-dark/10 text-info-dark animate-pulse' },
    success: { label: 'Selesai', cls: 'bg-success-dark/10 text-success-dark' },
    failed: { label: 'Gagal', cls: 'bg-error-dark/10 text-error-dark' },
};

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.pending;
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-micro font-semibold ${meta.cls}`}>
            {meta.label}
        </span>
    );
}

function formatTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

export default function Index({ regions = [], runs = [], osmTotal = 0 }) {
    const { flash, errors = {} } = usePage().props;

    const [mode, setMode] = useState('region');
    const [region, setRegion] = useState(regions[0]?.value || 'indonesia');
    const [bbox, setBbox] = useState({ south: '', west: '', north: '', east: '' });
    const [tile, setTile] = useState('0.5');
    const [sleep, setSleep] = useState('2');
    const [submitting, setSubmitting] = useState(false);

    const hasActiveRun = runs.some((r) => r.status === 'pending' || r.status === 'running');

    // Auto-refresh tabel selama ada impor yang berjalan (polling ringan tiap 5 detik).
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
            }
        );
    };

    const selectedRegion = regions.find((r) => r.value === region);

    return (
        <>
            <Head>
                <title>Admin | Impor Titik OSM</title>
            </Head>

            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="mx-auto w-full max-w-6xl">
                {/* Header */}
                <div className="flex flex-col items-center gap-4 border-b border-primary-10 pb-6 text-center sm:flex-row sm:text-left">
                    <img
                        src="/images/mascots/map-v2.png"
                        alt="NuraLoka Mascot"
                        className="h-24 w-24 shrink-0 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <h1 className="font-heading text-subtitle font-bold text-primary-100">
                            Impor Titik OSM
                        </h1>
                        <p className="mt-1 text-body text-gray-70">
                            Tarik data titik (POI) dari OpenStreetMap ke peta jelajah untuk daerah baru
                            di luar Jawa. Proses berjalan di latar belakang.
                        </p>
                        <p className="mt-2 text-small font-semibold text-primary-100">
                            Total titik OSM saat ini: {Number(osmTotal).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Catatan worker */}
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-info-dark/20 bg-info-dark/5 p-4">
                    <FaInfoCircle className="mt-0.5 shrink-0 text-info-dark" />
                    <p className="text-small text-gray-70">
                        Impor dijalankan sebagai <b>antrean (queue)</b>. Pastikan worker aktif
                        (<code className="rounded bg-gray-10 px-1">php artisan queue:work</code>) agar tugas diproses.
                        Area luas seperti <b>Seluruh Indonesia</b> bisa memakan waktu lama — gunakan jeda (sleep) yang
                        cukup untuk menghormati batas Overpass.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="mt-6 rounded-xl border border-primary-10 p-5">
                    {/* Mode switch */}
                    <div className="mb-5 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setMode('region')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-btn-sm font-semibold transition-colors ${
                                mode === 'region' ? 'bg-primary-100 text-white' : 'bg-primary-10 text-primary-100 hover:bg-primary-30'
                            }`}
                        >
                            <FaGlobeAsia /> Preset Region
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('custom')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-btn-sm font-semibold transition-colors ${
                                mode === 'custom' ? 'bg-primary-100 text-white' : 'bg-primary-10 text-primary-100 hover:bg-primary-30'
                            }`}
                        >
                            <FaMapMarkedAlt /> Koordinat Manual
                        </button>
                    </div>

                    {mode === 'region' ? (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="region" className="font-heading text-paragraph text-primary-100">
                                Pilih Region
                            </label>
                            <select
                                id="region"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="rounded-lg border-1 border-primary-100 bg-white px-4 py-3 font-body text-body focus:bg-primary-10 focus:outline-none"
                            >
                                {regions.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            {selectedRegion && (
                                <p className="mt-1 text-micro text-gray-50">
                                    bbox: {selectedRegion.bbox.join(', ')} (selatan, barat, utara, timur)
                                </p>
                            )}
                            {errors.region && <p className="text-small italic text-error-dark">{errors.region}</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Selatan (lat)" name="south" type="number" step="any"
                                value={bbox.south} onChange={(e) => setBbox({ ...bbox, south: e.target.value })}
                                placeholder="-8.30" error={errors.south}
                            />
                            <Input
                                label="Utara (lat)" name="north" type="number" step="any"
                                value={bbox.north} onChange={(e) => setBbox({ ...bbox, north: e.target.value })}
                                placeholder="-6.00" error={errors.north}
                            />
                            <Input
                                label="Barat (lng)" name="west" type="number" step="any"
                                value={bbox.west} onChange={(e) => setBbox({ ...bbox, west: e.target.value })}
                                placeholder="108.55" error={errors.west}
                            />
                            <Input
                                label="Timur (lng)" name="east" type="number" step="any"
                                value={bbox.east} onChange={(e) => setBbox({ ...bbox, east: e.target.value })}
                                placeholder="111.70" error={errors.east}
                            />
                        </div>
                    )}

                    {/* Opsi lanjutan */}
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Ukuran petak (derajat)" name="tile" type="number" step="any"
                            value={tile} onChange={(e) => setTile(e.target.value)}
                            placeholder="0.5" helperText="Makin kecil makin detail, tapi lebih banyak query."
                            error={errors.tile}
                        />
                        <Input
                            label="Jeda antar petak (detik)" name="sleep" type="number" step="any"
                            value={sleep} onChange={(e) => setSleep(e.target.value)}
                            placeholder="2" error={errors.sleep}
                        />
                    </div>

                    {errors.mode && <p className="mt-3 text-small italic text-error-dark">{errors.mode}</p>}

                    <div className="mt-5 flex items-center gap-3">
                        <Button
                            type="submit"
                            variant="primary"
                            iconLeft={<FaDownload />}
                            loading={submitting}
                            disabled={hasActiveRun}
                        >
                            Mulai Impor
                        </Button>
                        {hasActiveRun && (
                            <span className="text-small text-gray-50">
                                Masih ada impor berjalan — tunggu sampai selesai.
                            </span>
                        )}
                    </div>
                </form>

                {/* Riwayat */}
                <h2 className="mt-8 font-heading text-paragraph font-bold text-primary-100">Riwayat Impor</h2>
                <div className="mt-3 overflow-x-auto rounded-xl border border-primary-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-primary-10 text-primary-100">
                                <th className="px-4 py-3 font-heading text-small font-semibold">Area</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Status</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Titik Tersimpan</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Petak</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Waktu</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Oleh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runs.length > 0 ? runs.map((run) => (
                                <tr key={run.id} className="border-t border-primary-10 align-top">
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-primary-100 capitalize">{run.region}</span>
                                        <p className="text-micro text-gray-50">
                                            {Number(run.south).toFixed(2)}, {Number(run.west).toFixed(2)} → {Number(run.north).toFixed(2)}, {Number(run.east).toFixed(2)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={run.status} />
                                        {run.status === 'failed' && run.message && (
                                            <p className="mt-1 max-w-xs text-micro text-error-dark">{run.message}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-small text-gray-70">
                                        {Number(run.imported).toLocaleString('id-ID')}
                                        {run.places_before != null && run.places_after != null && (
                                            <span className="block text-micro text-gray-50">
                                                total {Number(run.places_before).toLocaleString('id-ID')} → {Number(run.places_after).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-small text-gray-70">
                                        {run.failed_tiles > 0 ? (
                                            <span className="text-error-dark">{run.failed_tiles} gagal</span>
                                        ) : '—'}
                                        {run.total_tiles > 0 && (
                                            <span className="block text-micro text-gray-50">dari {run.total_tiles} petak</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-micro text-gray-70">
                                        <span className="block">Mulai: {formatTime(run.started_at)}</span>
                                        <span className="block">Selesai: {formatTime(run.finished_at)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-small text-gray-70">
                                        {run.triggered_by_name || '—'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center text-body text-gray-50">
                                        Belum ada riwayat impor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <AdminLayout content={page}></AdminLayout>;
