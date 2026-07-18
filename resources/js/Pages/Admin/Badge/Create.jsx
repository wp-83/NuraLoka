import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import Dropdown from '@components/Forms/Dropdown';
import AdminLayout from '../../../Layouts/AdminLayout';

const TYPE_OPTIONS = [
    { value: 'general', label: 'Umum (bertingkat)' },
    { value: 'special', label: 'Khusus' },
];
const TIER_OPTIONS = [
    { value: 0, label: 'Tanpa tingkat' },
    { value: 1, label: '1 · Perunggu' },
    { value: 2, label: '2 · Perak' },
    { value: 3, label: '3 · Emas' },
    { value: 4, label: '4 · Berlian' },
];

export default function Create() {
    const [preview, setPreview] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        name: '', requirement_description: '', type: 'general', category: '',
        points: 0, tier_level: 0, tier_target: 0, icon_path: null,
    });

    const handleFile = (e) => {
        const f = e.target.files[0];
        setData('icon_path', f);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const submit = (e) => { e.preventDefault(); post(route('admin.badges.store')); };

    return (
        <>
            <Head><title>Admin | Tambah Lencana</title></Head>
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6">
                    <Button variant="white" size="btn-sm" iconLeft={<FaArrowLeft />} onClick={() => router.get(route('admin.badges.index'))}>
                        Kembali ke Daftar Lencana
                    </Button>
                </div>
                <h2 className="mb-6 border-b border-primary-10 pb-4 font-heading text-subtitle font-bold text-primary-100">Tambah Lencana Baru</h2>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <Input label="Nama Lencana" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: Si Paling Pantai (Emas)" error={errors.name} required />

                    <Input type="textarea" rows={3} label="Deskripsi Syarat" name="requirement_description"
                        value={data.requirement_description} onChange={(e) => setData('requirement_description', e.target.value)}
                        placeholder="Jelaskan cara mendapatkan lencana ini..." error={errors.requirement_description} />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Dropdown label="Tipe" name="type" value={data.type} onChange={(e) => setData('type', e.target.value)} options={TYPE_OPTIONS} error={errors.type} required />
                        <Input label="Kategori Lencana" name="category" value={data.category} onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Si Paling Pantai" error={errors.category} />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <Input type="number" min="0" label="Poin" name="points" value={data.points} onChange={(e) => setData('points', e.target.value)} error={errors.points} required />
                        <Dropdown label="Tingkat (Tier)" name="tier_level" value={data.tier_level} onChange={(e) => setData('tier_level', e.target.value)} options={TIER_OPTIONS} error={errors.tier_level} />
                        <Input type="number" min="0" label="Target Tier" name="tier_target" value={data.tier_target} onChange={(e) => setData('tier_target', e.target.value)} error={errors.tier_target} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-heading text-paragraph text-primary-100">Icon Lencana</label>
                        <div className="flex items-center gap-4">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary-30 bg-gray-10">
                                {preview ? <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" /> : <span className="px-2 text-center text-micro italic text-gray-50">Belum ada</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input id="badge-icon" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                                <Button variant="white" size="btn-sm" iconLeft={<FaUpload />} onClick={() => document.getElementById('badge-icon')?.click()}>Pilih File</Button>
                                <span className="text-micro text-gray-50">JPG, PNG, WEBP, SVG (Maks. 2MB). Opsional.</span>
                            </div>
                        </div>
                        {errors.icon_path && <p className="text-small italic text-error-dark">{errors.icon_path}</p>}
                    </div>

                    <div className="mt-2 flex justify-end gap-3 border-t border-primary-10 pt-5">
                        <Button variant="white" onClick={() => router.get(route('admin.badges.index'))}>Batal</Button>
                        <Button variant="success" type="submit" loading={processing}>{processing ? 'Menyimpan...' : 'Simpan Lencana'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <AdminLayout content={page}></AdminLayout>;
