import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { GiStairsGoal } from 'react-icons/gi';
import Flash from '@components/Common/Flash';
import Modal from '@components/Common/Modal';
import Button from '@components/Forms/Button';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ levels = [] }) {
    const { flash } = usePage().props;
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.levels.destroy', deleteTarget.id), {
            onStart: () => setDeleting(true),
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <>
            <Head><title>Admin | Kelola Level</title></Head>
            {flash && flash.message && <Flash type={flash.type || 'success'} message={flash.message} />}

            <div className="mx-auto w-full max-w-3xl">
                <div className="flex flex-col items-center gap-4 border-b border-primary-10 pb-6 text-center sm:flex-row sm:text-left">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-secondary-10 text-secondary-100">
                        <GiStairsGoal size={40} />
                    </div>
                    <div>
                        <h1 className="font-heading text-subtitle font-bold text-primary-100">Kelola Level</h1>
                        <p className="mt-1 text-body text-gray-70">
                            Atur tingkatan level & ambang poin. Level pengguna dihitung otomatis dari total poin Nura mereka.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="primary" iconLeft={<FaPlus />} onClick={() => router.get(route('admin.levels.create'))}>Tambah Level</Button>
                </div>

                <div className="mt-6 overflow-x-auto rounded-xl border border-primary-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-primary-10 text-primary-100">
                                <th className="px-4 py-3 font-heading text-small font-semibold">Urutan</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Nama Level</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Minimal Poin</th>
                                <th className="px-4 py-3 text-center font-heading text-small font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.length > 0 ? (
                                levels.map((lvl) => (
                                    <tr key={lvl.id} className="border-t border-primary-10 transition-colors hover:bg-secondary-10">
                                        <td className="px-4 py-3 font-semibold text-primary-100">#{lvl.order}</td>
                                        <td className="px-4 py-3 text-primary-100">{lvl.name}</td>
                                        <td className="px-4 py-3 text-small text-gray-70">≥ {Number(lvl.min_points).toLocaleString('id-ID')} poin</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="info" size="btn-sm" iconLeft={<FaEdit />} onClick={() => router.get(route('admin.levels.edit', lvl.id))}>Edit</Button>
                                                <Button variant="error" size="btn-sm" iconLeft={<FaTrash />} onClick={() => setDeleteTarget({ id: lvl.id, name: lvl.name })}>Hapus</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-4 py-12 text-center text-body text-gray-50">Belum ada level.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} type="error"
                title={`Hapus level "${deleteTarget?.name}"?`}
                actions={[
                    { label: 'Batal', variant: 'gray', onClick: () => setDeleteTarget(null), disabled: deleting },
                    { label: 'Hapus', variant: 'error', onClick: confirmDelete, loading: deleting },
                ]} />
        </>
    );
}

Index.layout = (page) => <AdminLayout content={page}></AdminLayout>;
