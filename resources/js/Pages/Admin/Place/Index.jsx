import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import Modal from '@components/Common/Modal';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ places, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [source, setSource] = useState(filters.source || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (overrides = {}) => {
        const params = { search, source, ...overrides };
        // Buang parameter kosong agar URL tetap bersih.
        Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
        router.get(route('admin.places.index'), params, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleSourceChange = (value) => {
        setSource(value);
        applyFilters({ source: value });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.places.destroy', deleteTarget.id), {
            onStart: () => setDeleting(true),
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head>
                <title>Admin | Kelola Destinasi Wisata</title>
            </Head>

            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="mx-auto w-full max-w-6xl">
                {/* Header */}
                <div className="flex flex-col items-center gap-4 border-b border-primary-10 pb-6 text-center sm:flex-row sm:text-left">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="h-24 w-24 shrink-0 object-contain"
                    />
                    <div>
                        <h1 className="font-heading text-subtitle font-bold text-primary-100">
                            Kelola Destinasi Wisata
                        </h1>
                        <p className="mt-1 text-body text-gray-70">
                            Tambah, ubah, dan hapus data destinasi wisata. Setiap destinasi dapat
                            dihubungkan ke beberapa kategori.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <form onSubmit={handleSearch} className="w-full sm:max-w-md">
                            <Input
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari destinasi berdasarkan nama atau alamat..."
                                icon={<FaSearch />}
                            />
                        </form>

                        {/* Filter sumber data (internal admin / hasil impor OSM) */}
                        <select
                            value={source}
                            onChange={(e) => handleSourceChange(e.target.value)}
                            className="w-full rounded-lg border border-primary-10 bg-white px-3 py-2 font-body text-small text-primary-100 outline-none focus:border-secondary-100 sm:w-48"
                        >
                            <option value="">Semua Sumber</option>
                            <option value="internal">Internal (NuraLoka)</option>
                            <option value="osm">OSM (Impor)</option>
                        </select>
                    </div>

                    <Button
                        variant="primary"
                        iconLeft={<FaPlus />}
                        onClick={() => router.get(route('admin.places.create'))}
                        className="shrink-0"
                    >
                        Tambah Destinasi
                    </Button>
                </div>

                {/* Table */}
                <div className="mt-6 overflow-x-auto rounded-xl border border-primary-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-primary-10 text-primary-100">
                                <th className="px-4 py-3 font-heading text-small font-semibold">Nama Destinasi</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Alamat</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Koordinat</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Kategori</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Sumber</th>
                                <th className="px-4 py-3 text-center font-heading text-small font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {places.data && places.data.length > 0 ? (
                                places.data.map((place) => (
                                    <tr
                                        key={place.id}
                                        className="border-t border-primary-10 align-top transition-colors hover:bg-secondary-10"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-2 font-semibold text-primary-100">
                                                <FaMapMarkerAlt className="shrink-0 text-error-dark" />
                                                {place.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-small text-gray-70">
                                            {place.address || (
                                                <span className="italic text-gray-50">Alamat belum tersedia</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block rounded-md bg-gray-10 px-2 py-1 font-body text-micro text-gray-70">
                                                {parseFloat(place.latitude).toFixed(5)}, {parseFloat(place.longitude).toFixed(5)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {place.categories && place.categories.length > 0 ? (
                                                    place.categories.map((cat) => (
                                                        <span
                                                            key={cat.id}
                                                            className="inline-flex rounded-full bg-secondary-10 px-2.5 py-1 text-micro font-semibold text-secondary-100"
                                                        >
                                                            {cat.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-10 px-2.5 py-1 text-micro italic text-gray-50">
                                                        Tidak ada
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {place.source === 'osm' ? (
                                                <span className="inline-flex rounded-full bg-info-light px-2.5 py-1 text-micro font-semibold text-info-dark">
                                                    OSM
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-secondary-10 px-2.5 py-1 text-micro font-semibold text-secondary-100">
                                                    Internal
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="info"
                                                    size="btn-sm"
                                                    iconLeft={<FaEdit />}
                                                    onClick={() => router.get(route('admin.places.edit', place.id))}
                                                    title="Edit Destinasi"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="error"
                                                    size="btn-sm"
                                                    iconLeft={<FaTrash />}
                                                    onClick={() => setDeleteTarget({ id: place.id, name: place.name })}
                                                    title="Hapus Destinasi"
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center text-body text-gray-50">
                                        {search
                                            ? 'Tidak ada destinasi yang cocok dengan pencarian Anda.'
                                            : 'Belum ada data destinasi wisata.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {places.links && places.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {places.links.map((link, index) => {
                            let label = link.label;
                            if (label.includes('Previous')) label = 'Sebelumnya';
                            else if (label.includes('Next')) label = 'Selanjutnya';

                            const base =
                                'min-w-9 rounded-lg px-3 py-2 text-small font-semibold transition-colors';

                            if (!link.url) {
                                return (
                                    <span
                                        key={index}
                                        className={`${base} cursor-not-allowed bg-gray-10 text-gray-30`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => router.get(link.url)}
                                    className={`${base} ${
                                        link.active
                                            ? 'bg-primary-100 text-white'
                                            : 'bg-primary-10 text-primary-100 hover:bg-primary-30'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                type="error"
                title={`Apakah kamu yakin ingin menghapus "${deleteTarget?.name}"?`}
                actions={[
                    {
                        label: 'Batal',
                        variant: 'gray',
                        onClick: () => setDeleteTarget(null),
                        disabled: deleting,
                    },
                    {
                        label: 'Hapus Data',
                        variant: 'error',
                        onClick: confirmDelete,
                        loading: deleting,
                    },
                ]}
            />
        </>
    );
}

Index.layout = (page) => <AdminLayout content={page}></AdminLayout>;
