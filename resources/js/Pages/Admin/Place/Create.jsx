import { Head, useForm, router } from '@inertiajs/react';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import Checkbox from '@components/Forms/Checkbox';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        categories: [],
        photos: [],
    });

    const handlePhotos = (e) => {
        setData('photos', Array.from(e.target.files || []));
    };

    const toggleCategory = (id) => {
        const selected = data.categories.includes(id)
            ? data.categories.filter((c) => c !== id)
            : [...data.categories, id];
        setData('categories', selected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.places.store'));
    };

    return (
        <>
            <Head>
                <title>Admin | Tambah Destinasi Wisata</title>
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
                    Tambah Destinasi Wisata Baru
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
                                    Belum ada kategori tersedia.{' '}
                                    <button
                                        type="button"
                                        onClick={() => router.get(route('admin.categories.create'))}
                                        className="font-semibold text-primary-100 underline"
                                    >
                                        Tambah kategori dulu
                                    </button>
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

                        {/* Photos */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-heading text-paragraph text-primary-100">
                                Foto Destinasi (opsional)
                            </label>
                            <p className="text-small text-gray-70">
                                Unggah satu atau beberapa foto. Foto ini akan tampil di galeri
                                halaman detail bersama foto dari album populer Nuravers.
                            </p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                multiple
                                onChange={handlePhotos}
                                className="mt-2 block w-full cursor-pointer rounded-xl border border-primary-10 bg-gray-10 px-3 py-2 font-body text-small text-gray-70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-primary-85"
                            />
                            {data.photos.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                    {data.photos.map((file, i) => (
                                        <img
                                            key={i}
                                            src={URL.createObjectURL(file)}
                                            alt={`Pratinjau ${i + 1}`}
                                            className="h-24 w-full rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                            {(errors.photos || errors['photos.0']) && (
                                <p className="text-small italic text-error-dark">
                                    {errors.photos || errors['photos.0']}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-2 flex justify-end gap-3 border-t border-primary-10 pt-5">
                            <Button
                                variant="white"
                                onClick={() => router.get(route('admin.places.index'))}
                            >
                                Batal
                            </Button>
                            <Button variant="success" type="submit" loading={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Destinasi'}
                            </Button>
                        </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <AdminLayout content={page}></AdminLayout>;
