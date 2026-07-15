import { Head, useForm, router } from '@inertiajs/react';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import Checkbox from '@components/Forms/Checkbox';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ place, categories }) {
    // Pre-fill selected category IDs from the existing place data
    const existingCategoryIds = place.categories ? place.categories.map((c) => c.id) : [];

    const { data, setData, post, processing, errors } = useForm({
        name: place.name || '',
        description: place.description || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        address: place.address || '',
        categories: existingCategoryIds,
    });

    const toggleCategory = (id) => {
        const selected = data.categories.includes(id)
            ? data.categories.filter((c) => c !== id)
            : [...data.categories, id];
        setData('categories', selected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.places.update', place.id));
    };

    return (
        <>
            <Head>
                <title>Admin | Edit Destinasi Wisata</title>
            </Head>

            <div className="mx-auto w-full max-w-3xl">
                {/* Back button */}
                <div className="mb-6">
                    <Button
                        variant="primary"
                        size="btn-sm"
                        iconLeft={<FaArrowLeft />}
                        onClick={() => router.get(route('admin.places.index'))}
                    >
                        Kembali ke Daftar Destinasi
                    </Button>
                </div>

                <h2 className="mb-6 border-b border-primary-10 pb-4 font-heading text-subtitle font-bold text-primary-100">
                    Edit Destinasi Wisata
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Input
                            label="Nama Destinasi"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Pantai Bira, Taman Nasional Baluran..."
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Alamat Lengkap"
                            name="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Contoh: Jl. Pantai Bira, Kab. Bulukumba, Sulawesi Selatan"
                            error={errors.address}
                            required
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                label="Latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={data.latitude}
                                onChange={(e) => setData('latitude', e.target.value)}
                                placeholder="-5.68432"
                                error={errors.latitude}
                                required
                            />
                            <Input
                                label="Longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={data.longitude}
                                onChange={(e) => setData('longitude', e.target.value)}
                                placeholder="120.43281"
                                error={errors.longitude}
                                required
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-heading text-paragraph text-primary-100">
                                Kategori Destinasi
                            </label>
                            <p className="text-small text-gray-70">
                                Pilih satu atau lebih kategori yang sesuai untuk destinasi ini.
                            </p>

                            {categories && categories.length > 0 ? (
                                <div className="mt-2 grid grid-cols-1 gap-3 rounded-xl border border-primary-10 bg-gray-10 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {categories.map((cat) => (
                                        <Checkbox
                                            key={cat.id}
                                            id={`cat-${cat.id}`}
                                            label={cat.name}
                                            checked={data.categories.includes(cat.id)}
                                            onChange={() => toggleCategory(cat.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-small italic text-gray-50">
                                    Belum ada kategori tersedia.
                                </p>
                            )}
                            {errors.categories && (
                                <p className="text-small italic text-error-dark">{errors.categories}</p>
                            )}
                        </div>

                        <Input
                            label="Deskripsi Destinasi"
                            name="description"
                            type="textarea"
                            rows={5}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tuliskan deskripsi lengkap tentang destinasi wisata ini..."
                            error={errors.description}
                            required
                        />

                        {/* Actions */}
                        <div className="mt-2 flex justify-end gap-3 border-t border-primary-10 pt-5">
                            <Button
                                variant="white"
                                onClick={() => router.get(route('admin.places.index'))}
                            >
                                Batal
                            </Button>
                            <Button variant="success" type="submit" loading={processing}>
                                {processing ? 'Memperbarui...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <AdminLayout content={page}></AdminLayout>;
