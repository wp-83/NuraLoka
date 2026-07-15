import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaMedal } from 'react-icons/fa';
import Flash from '@components/Common/Flash';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ missions, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.missions.index'), { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (id, title, usersCount) => {
        if (usersCount > 0) {
            alert(`Tantangan "${title}" tidak dapat dihapus karena sudah diambil oleh ${usersCount} pengguna.`);
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus tantangan "${title}"?`)) {
            router.delete(route('admin.missions.destroy', id));
        }
    };

    return (
        <>
            <Head>
                <title>Admin | Kelola Tantangan</title>
            </Head>

            {flash && flash.message && (
                <Flash type={flash.type || 'success'} message={flash.message} />
            )}

            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-12 animate-fade-in">
                {/* Back navigation */}
                <div className="flex justify-start">
                    <Link
                        href={route('admin.dashboard.index')}
                        className="inline-flex items-center gap-2 font-body text-body font-semibold text-primary transition-all duration-200 hover:-translate-x-1 hover:text-primary-85"
                    >
                        <FaArrowLeft className="text-small" /> Kembali ke Dashboard Admin
                    </Link>
                </div>

                {/* Header */}
                <section className="flex flex-col items-center gap-6 rounded-2xl border border-primary-30 bg-secondary-10 p-6 shadow-[0_4px_20px_rgba(76,59,50,0.05)] sm:flex-row sm:p-8">
                    <img
                        src="/images/mascots/welcome.png"
                        alt="NuraLoka Mascot"
                        className="h-[90px] w-[90px] shrink-0 object-contain"
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="mb-2 font-heading text-title font-bold text-primary-100">Kelola Tantangan (Missions)</h1>
                        <p className="font-body text-body leading-relaxed text-gray-70">
                            Tambah, ubah, dan hapus daftar tantangan untuk para pengguna NuraLoka.
                        </p>
                    </div>
                </section>

                {/* Toolbar */}
                <section className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <form onSubmit={handleSearch} className="w-full max-w-md">
                        <Input
                            type="text"
                            placeholder="Cari tantangan berdasarkan judul..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            iconRight={<button type="submit" className="hover:text-primary"><FaSearch /></button>}
                        />
                    </form>

                    <Link href={route('admin.missions.create')} className="w-full sm:w-auto">
                        <Button variant="primary" iconLeft={<FaPlus className="mr-2" />} fullWidth>
                            Tambah Tantangan
                        </Button>
                    </Link>
                </section>

                {/* Table Section */}
                <section className="overflow-hidden rounded-2xl border border-primary-30 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-body">
                            <thead>
                                <tr className="border-b border-primary-30 bg-primary-10 text-primary-100">
                                    <th className="px-6 py-4 font-semibold w-1/4">Judul</th>
                                    <th className="px-6 py-4 font-semibold w-1/5">Lencana (Badge)</th>
                                    <th className="px-6 py-4 font-semibold w-[15%] text-center">Poin</th>
                                    <th className="px-6 py-4 font-semibold w-[15%] text-center">Peserta</th>
                                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-30">
                                {missions.data && missions.data.length > 0 ? (
                                    missions.data.map((mission) => (
                                        <tr key={mission.id} className="transition-colors hover:bg-secondary-10">
                                            <td className="px-6 py-4">
                                                <div className="font-heading font-semibold text-primary-100">
                                                    {mission.title}
                                                </div>
                                                <div className="mt-1 text-small text-gray-70">
                                                    {mission.description.length > 50 ? `${mission.description.substring(0, 50)}...` : mission.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {mission.badge ? (
                                                    <div className="flex items-center gap-2">
                                                        {mission.badge.icon_path ? (
                                                            <img
                                                                src={mission.badge.icon_path}
                                                                alt={mission.badge.name}
                                                                className="h-6 w-6 object-contain"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <FaMedal className="text-primary-50" />
                                                        )}
                                                        <span className="font-medium text-gray-85">{mission.badge.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-50 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center rounded-full bg-accent-10 px-3 py-1 font-semibold text-accent-100">
                                                    +{mission.points_reward} Pts
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${mission.users_count > 0 ? 'bg-success-light text-success-dark' : 'bg-gray-10 text-gray-50'}`}>
                                                    {mission.users_count} Pengguna
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link href={route('admin.missions.edit', mission.id)}>
                                                        <Button variant="info" size="btn-sm" title="Edit Tantangan">
                                                            <FaEdit />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="error"
                                                        size="btn-sm"
                                                        onClick={() => handleDelete(mission.id, mission.title, mission.users_count)}
                                                        disabled={mission.users_count > 0}
                                                        title={mission.users_count > 0 ? 'Tidak bisa dihapus — sudah ada pengguna' : 'Hapus Tantangan'}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-50">
                                            {search ? 'Tidak ada tantangan yang cocok dengan pencarian Anda.' : 'Belum ada data tantangan.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Pagination */}
                {missions.links && missions.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-1 rounded-xl border border-primary-30 bg-white p-2">
                            {missions.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = 'Sebelumnya';
                                else if (label.includes('Next')) label = 'Selanjutnya';

                                if (!link.url) {
                                    return (
                                        <span
                                            key={index}
                                            className="px-4 py-2 text-small font-medium text-gray-50 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 text-small font-semibold transition-colors rounded-lg ${link.active ? 'bg-primary-100 text-white' : 'text-primary-100 hover:bg-primary-10'}`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <AdminLayout content={page}></AdminLayout>
