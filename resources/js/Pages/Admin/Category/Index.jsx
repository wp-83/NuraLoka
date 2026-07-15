import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTag } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import Modal from '@components/Common/Modal';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.categories.index'), { search }, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (cat) => {
        if (cat.places_count > 0) {
            alert(`Kategori "${cat.name}" tidak dapat dihapus karena masih digunakan oleh ${cat.places_count} destinasi.`);
            return;
        }
        setDeleteTarget({ id: cat.id, name: cat.name });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.categories.destroy', deleteTarget.id), {
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
                <title>Admin | Kelola Kategori Destinasi</title>
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
                            Kelola Kategori Destinasi
                        </h1>
                        <p className="mt-1 text-body text-gray-70">
                            Tambah, ubah, dan hapus kategori destinasi wisata. Kategori digunakan untuk
                            mengklasifikasi tempat-tempat di NuraLoka.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="w-full sm:max-w-md">
                        <Input
                            name="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kategori berdasarkan nama..."
                            icon={<FaSearch />}
                        />
                    </form>

                    <Button
                        variant="primary"
                        iconLeft={<FaPlus />}
                        onClick={() => router.get(route('admin.categories.create'))}
                        className="shrink-0"
                    >
                        Tambah Kategori
                    </Button>
                </div>

                {/* Table */}
                <div className="mt-6 overflow-x-auto rounded-xl border border-primary-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-primary-10 text-primary-100">
                                <th className="px-4 py-3 font-heading text-small font-semibold">Icon</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Nama Kategori</th>
                                <th className="px-4 py-3 text-center font-heading text-small font-semibold">Jumlah Destinasi</th>
                                <th className="px-4 py-3 text-center font-heading text-small font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data && categories.data.length > 0 ? (
                                categories.data.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="border-t border-primary-10 transition-colors hover:bg-secondary-10"
                                    >
                                        <td className="px-4 py-3">
                                            {cat.icon_path ? (
                                                <img
                                                    src={cat.icon_path}
                                                    alt={cat.name}
                                                    className="h-10 w-10 rounded-lg object-contain"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-10 text-primary-50">
                                                    <FaTag />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-primary-100">
                                            {cat.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-micro font-semibold ${
                                                    cat.places_count === 0
                                                        ? 'bg-gray-10 text-gray-50'
                                                        : 'bg-secondary-10 text-secondary-100'
                                                }`}
                                            >
                                                {cat.places_count} Destinasi
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="info"
                                                    size="btn-sm"
                                                    iconLeft={<FaEdit />}
                                                    onClick={() => router.get(route('admin.categories.edit', cat.id))}
                                                    title="Edit Kategori"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="error"
                                                    size="btn-sm"
                                                    iconLeft={<FaTrash />}
                                                    onClick={() => handleDeleteClick(cat)}
                                                    title={cat.places_count > 0 ? 'Tidak bisa dihapus — masih digunakan' : 'Hapus Kategori'}
                                                    className={cat.places_count > 0 ? 'opacity-50' : ''}
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-12 text-center text-body text-gray-50">
                                        {search
                                            ? 'Tidak ada kategori yang cocok dengan pencarian Anda.'
                                            : 'Belum ada data kategori.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categories.links && categories.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {categories.links.map((link, index) => {
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
                type="warning"
                title={`Apakah kamu yakin ingin menghapus kategori "${deleteTarget?.name}"?`}
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
