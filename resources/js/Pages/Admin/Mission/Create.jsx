import { Link, Head, useForm } from '@inertiajs/react';
import { FaArrowLeft, FaSave, FaExclamationCircle } from 'react-icons/fa';
import Input from '@components/Forms/Input';
import Dropdown from '@components/Forms/Dropdown';
import Button from '@components/Forms/Button';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create({ badges }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        points_reward: 0,
        badge_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.missions.store'));
    };

    const badgeOptions = badges ? badges.map(b => ({ label: b.name, value: b.id })) : [];

    return (
        <>
            <Head>
                <title>Admin | Tambah Tantangan</title>
            </Head>

            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-12 animate-fade-in">
                {/* Back navigation */}
                <div className="flex justify-start">
                    <Link
                        href={route('admin.missions.index')}
                        className="inline-flex items-center gap-2 font-body text-body font-semibold text-primary transition-all duration-200 hover:-translate-x-1 hover:text-primary-85"
                    >
                        <FaArrowLeft className="text-small" /> Kembali ke Daftar Tantangan
                    </Link>
                </div>

                {/* Header */}
                <section className="flex flex-col items-center gap-6 rounded-2xl border border-primary-30 bg-secondary-10 p-6 shadow-[0_4px_20px_rgba(76,59,50,0.05)] sm:flex-row sm:p-8">
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="mb-2 font-heading text-title font-bold text-primary-100">Tambah Tantangan Baru</h1>
                        <p className="font-body text-body leading-relaxed text-gray-70">
                            Buat tantangan baru beserta reward poin dan lencana yang akan didapat pengguna.
                        </p>
                    </div>
                </section>

                {/* Form Container */}
                <section className="rounded-2xl border border-primary-30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:p-8">
                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <Input
                            label="Judul Tantangan"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Kunjungi 5 Pantai"
                            error={errors.title}
                            required
                        />

                        <Input
                            type="textarea"
                            label="Deskripsi"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Jelaskan detail tantangan ini..."
                            rows={4}
                            error={errors.description}
                            required
                        />

                        <Input
                            type="number"
                            label="Reward Poin"
                            name="points_reward"
                            value={data.points_reward}
                            onChange={(e) => setData('points_reward', e.target.value)}
                            placeholder="Contoh: 100"
                            error={errors.points_reward}
                            min="0"
                            required
                        />

                        <div>
                            <Dropdown
                                label="Lencana (Badge)"
                                name="badge_id"
                                value={data.badge_id}
                                onChange={(e) => setData('badge_id', e.target.value)}
                                options={badgeOptions}
                                placeholder="Pilih lencana untuk tantangan ini"
                                error={errors.badge_id}
                                required
                            />
                            {badges && badges.length === 0 && (
                                <p className="mt-2 inline-flex items-center gap-1 text-small italic text-error-dark">
                                    <FaExclamationCircle /> Belum ada lencana yang tersedia.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button type="submit" variant="primary" loading={processing} iconLeft={<FaSave className="mr-2" />}>
                                {processing ? 'Menyimpan...' : 'Simpan Tantangan'}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}

Create.layout = (page) => <AdminLayout content={page}></AdminLayout>
