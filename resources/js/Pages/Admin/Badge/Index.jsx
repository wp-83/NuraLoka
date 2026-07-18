import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMedal } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import Modal from '@components/Common/Modal';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

const TIER = ['—', 'Perunggu', 'Perak', 'Emas', 'Berlian'];

export default function Index({ badges, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.badges.index'), { search }, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.badges.destroy', deleteTarget.id), {
            onStart: () => setDeleting(true),
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <>
            <Head><title>Admin | Kelola Lencana</title></Head>
            {flash && flash.message && <Flash type={flash.type || 'success'} message={flash.message} />}

            <div className="mx-auto w-full max-w-6xl">
                <div className="flex flex-col items-center gap-4 border-b border-primary-10 pb-6 text-center sm:flex-row sm:text-left">
                    <img src="/images/mascots/welcome.png" alt="Mascot" className="h-24 w-24 shrink-0 object-contain" />
                    <div>
                        <h1 className="font-heading text-subtitle font-bold text-primary-100">Kelola Lencana</h1>
                        <p className="mt-1 text-body text-gray-70">
                            Tambah, ubah, dan hapus lencana. Lencana ditautkan ke tantangan dan diberikan otomatis saat pengguna menyelesaikan misinya.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="w-full sm:max-w-md">
                        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari lencana berdasarkan nama atau kategori..." icon={<FaSearch />} />
                    </form>
                    <Button variant="primary" iconLeft={<FaPlus />} onClick={() => router.get(route('admin.badges.create'))} className="shrink-0">
                        Tambah Lencana
                    </Button>
                </div>

                <div className="mt-6 overflow-x-auto rounded-xl border border-primary-10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-primary-10 text-primary-100">
                                <th className="px-4 py-3 font-heading text-small font-semibold">Lencana</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Tipe / Kategori</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Tier</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Poin</th>
                                <th className="px-4 py-3 font-heading text-small font-semibold">Dipakai</th>
                                <th className="px-4 py-3 text-center font-heading text-small font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {badges.data && badges.data.length > 0 ? (
                                badges.data.map((badge) => (
                                    <tr key={badge.id} className="border-t border-primary-10 align-middle transition-colors hover:bg-secondary-10">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-30 bg-white">
                                                    {badge.icon_path ? (
                                                        <img src={badge.icon_path.startsWith('http') ? badge.icon_path : `/${badge.icon_path}`} alt={badge.name} className="h-8 w-8 object-contain" />
                                                    ) : (<FaMedal className="text-gray-30" />)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary-100">{badge.name}</p>
                                                    {badge.requirement_description && (
                                                        <p className="max-w-xs truncate text-micro text-gray-50">{badge.requirement_description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-micro font-semibold ${badge.type === 'special' ? 'bg-info-light text-info-dark' : 'bg-secondary-10 text-secondary-100'}`}>
                                                {badge.type === 'special' ? 'Khusus' : 'Umum'}
                                            </span>
                                            <div className="mt-1 text-micro text-gray-70">{badge.category || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-small text-gray-70">
                                            {TIER[badge.tier_level] || badge.tier_level}
                                            {badge.tier_target > 0 && <span className="text-gray-50"> · target {badge.tier_target}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-small font-semibold text-primary-100">{badge.points}</td>
                                        <td className="px-4 py-3 text-small text-gray-70">{badge.missions_count} misi</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="info" size="btn-sm" iconLeft={<FaEdit />} onClick={() => router.get(route('admin.badges.edit', badge.id))}>Edit</Button>
                                                <Button variant="error" size="btn-sm" iconLeft={<FaTrash />} onClick={() => setDeleteTarget({ id: badge.id, name: badge.name })}>Hapus</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-4 py-12 text-center text-body text-gray-50">
                                    {search ? 'Tidak ada lencana yang cocok.' : 'Belum ada lencana.'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {badges.links && badges.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {badges.links.map((link, index) => {
                            let label = link.label;
                            if (label.includes('Previous')) label = 'Sebelumnya';
                            else if (label.includes('Next')) label = 'Selanjutnya';
                            const base = 'min-w-9 rounded-lg px-3 py-2 text-small font-semibold transition-colors';
                            if (!link.url) return <span key={index} className={`${base} cursor-not-allowed bg-gray-10 text-gray-30`} dangerouslySetInnerHTML={{ __html: label }} />;
                            return <button key={index} type="button" onClick={() => router.get(link.url)}
                                className={`${base} ${link.active ? 'bg-primary-100 text-white' : 'bg-primary-10 text-primary-100 hover:bg-primary-30'}`}
                                dangerouslySetInnerHTML={{ __html: label }} />;
                        })}
                    </div>
                )}
            </div>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} type="error"
                title={`Hapus lencana "${deleteTarget?.name}"?`}
                actions={[
                    { label: 'Batal', variant: 'gray', onClick: () => setDeleteTarget(null), disabled: deleting },
                    { label: 'Hapus', variant: 'error', onClick: confirmDelete, loading: deleting },
                ]} />
        </>
    );
}

Index.layout = (page) => <AdminLayout content={page}></AdminLayout>;
