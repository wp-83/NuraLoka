import { Head, useForm, router } from '@inertiajs/react';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create({ nextOrder = 1 }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', min_points: 0, order: nextOrder,
    });

    const submit = (e) => { e.preventDefault(); post(route('admin.levels.store')); };

    return (
        <>
            <Head><title>Admin | Tambah Level</title></Head>
            <div className="mx-auto w-full max-w-xl">
                <div className="mb-6">
                    <Button variant="white" size="btn-sm" iconLeft={<FaArrowLeft />} onClick={() => router.get(route('admin.levels.index'))}>
                        Kembali ke Daftar Level
                    </Button>
                </div>
                <h2 className="mb-6 border-b border-primary-10 pb-4 font-heading text-subtitle font-bold text-primary-100">Tambah Level Baru</h2>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <Input label="Nama Level" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: Petualang" error={errors.name} required />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input type="number" min="0" label="Minimal Poin" name="min_points" value={data.min_points}
                            onChange={(e) => setData('min_points', e.target.value)} placeholder="Contoh: 2000" error={errors.min_points} required />
                        <Input type="number" min="1" label="Urutan" name="order" value={data.order}
                            onChange={(e) => setData('order', e.target.value)} error={errors.order} required />
                    </div>

                    <div className="mt-2 flex justify-end gap-3 border-t border-primary-10 pt-5">
                        <Button variant="white" onClick={() => router.get(route('admin.levels.index'))}>Batal</Button>
                        <Button variant="success" type="submit" loading={processing}>{processing ? 'Menyimpan...' : 'Simpan Level'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <AdminLayout content={page}></AdminLayout>;
