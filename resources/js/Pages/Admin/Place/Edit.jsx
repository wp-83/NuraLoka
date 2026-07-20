import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Checkbox from '@components/Forms/Checkbox';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';

import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';

export default function Edit({ place, categories, photos = [] }) {
    const { t } = useTranslation();

    // Pre-fill selected category IDs from the existing place data.
    const existingCategoryIds = place.categories ? place.categories.map((c) => c.id) : [];

    const { data, setData, post, processing, errors } = useForm({
        name: place.name || '',
        description: place.description || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        address: place.address || '',
        min_price: place.min_price ?? '',
        max_price: place.max_price ?? '',
        categories: existingCategoryIds,
        photos: [],
        deleted_photos: [],
    });

    const toggleCategory = (id) => {
        const selected = data.categories.includes(id)
            ? data.categories.filter((c) => c !== id)
            : [...data.categories, id];
        setData('categories', selected);
    };

    const handlePhotos = (e) => {
        setData('photos', Array.from(e.target.files || []));
    };

    const toggleRemoveExisting = (id) => {
        const marked = data.deleted_photos.includes(id)
            ? data.deleted_photos.filter((p) => p !== id)
            : [...data.deleted_photos, id];
        setData('deleted_photos', marked);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.places.update', place.slug));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.places.edit_title')}
                description={t('admin.places.edit_description', { name: place.name })}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        type="button"
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.places.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Destination Information */}
                <FormSection
                    title={t('admin.places.section_info_title')}
                    description={t('admin.places.section_info_description')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.places.label_name')}
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('admin.places.placeholder_name')}
                            error={errors.name}
                            required
                        />

                        <Input
                            label={t('admin.places.label_address')}
                            name="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder={t('admin.places.placeholder_address')}
                            error={errors.address}
                            required
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                label={t('admin.places.label_latitude')}
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
                                label={t('admin.places.label_longitude')}
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

                        <Input
                            label={t('admin.places.label_description')}
                            name="description"
                            type="textarea"
                            rows={5}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('admin.places.placeholder_description')}
                            error={errors.description}
                            required
                        />
                    </div>
                </FormSection>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                label="Harga Minimal (Rp)"
                                name="min_price"
                                type="number"
                                value={data.min_price}
                                onChange={(e) => setData('min_price', e.target.value)}
                                placeholder="Contoh: 15000 (Kosongkan jika gratis)"
                                error={errors.min_price}
                            />
                            <Input
                                label="Harga Maksimal (Rp)"
                                name="max_price"
                                type="number"
                                value={data.max_price}
                                onChange={(e) => setData('max_price', e.target.value)}
                                placeholder="Contoh: 50000 (Kosongkan jika gratis)"
                                error={errors.max_price}
                            />
                        </div>

                        {/* Photos */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-heading text-paragraph text-primary-100">
                                Foto Destinasi
                            </label>
                            <p className="text-small text-gray-70">
                                Kelola foto yang tampil di galeri detail. Klik tanda silang untuk
                                menandai foto yang akan dihapus saat disimpan.
                            </p>

                            {photos.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                    {photos.map((photo) => {
                                        const marked = data.deleted_photos.includes(photo.id);
                                        return (
                                            <div key={photo.id} className="relative">
                                                <img
                                                    src={photo.url}
                                                    alt="Foto destinasi"
                                                    className={`h-24 w-full rounded-lg object-cover transition ${marked ? 'opacity-30 grayscale' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRemoveExisting(photo.id)}
                                                    title={marked ? 'Batalkan hapus' : 'Tandai untuk dihapus'}
                                                    className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow ${marked ? 'bg-gray-50' : 'bg-error-dark'}`}
                                                >
                                                    <FaTimes size={11} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                multiple
                                onChange={handlePhotos}
                                className="mt-3 block w-full cursor-pointer rounded-xl border border-primary-10 bg-gray-10 px-3 py-2 font-body text-small text-gray-70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-primary-85"
                            />
                            {data.photos.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                    {data.photos.map((file, i) => (
                {/* Categories */}
                <FormSection
                    title={t('admin.places.section_categories_title')}
                    description={t('admin.places.section_categories_description')}
                >
                    {categories && categories.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-20 bg-gray-10 p-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        <p className="font-body text-small italic text-gray-50">
                            {t('admin.places.no_categories_available')}
                        </p>
                    )}

                    {errors.categories && (
                        <p className="mt-2 font-body text-small italic text-error-dark">
                            {errors.categories}
                        </p>
                    )}
                </FormSection>

                {/* Photos */}
                <FormSection
                    title={t('admin.places.section_photos_title_edit')}
                    description={t('admin.places.section_photos_description_edit')}
                >
                    {photos.length > 0 && (
                        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {photos.map((photo) => {
                                const marked = data.deleted_photos.includes(photo.id);

                                return (
                                    <div key={photo.id} className="relative">
                                        <img
                                            src={photo.url}
                                            alt={t('admin.places.section_photos_title_edit')}
                                            className={[
                                                'h-24 w-full rounded-lg object-cover transition',
                                                marked && 'opacity-30 grayscale',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => toggleRemoveExisting(photo.id)}
                                            title={
                                                marked
                                                    ? t('admin.places.photo_mark_undo')
                                                    : t('admin.places.photo_mark_delete')
                                            }
                                            className={[
                                                'absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow',
                                                marked ? 'bg-gray-50' : 'bg-error-dark',
                                            ].join(' ')}
                                        >
                                            <FiX size={13} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        multiple
                        onChange={handlePhotos}
                        className="block w-full cursor-pointer rounded-xl border border-gray-20 bg-gray-10 px-3 py-2 font-body text-small text-gray-70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-primary-85"
                    />

                    {data.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {data.photos.map((file, i) => (
                                <img
                                    key={i}
                                    src={URL.createObjectURL(file)}
                                    alt={t('admin.places.photo_preview_alt', { index: i + 1 })}
                                    className="h-24 w-full rounded-lg object-cover ring-2 ring-success-dark"
                                />
                            ))}
                        </div>
                    )}

                    {(errors.photos || errors['photos.0']) && (
                        <p className="mt-2 font-body text-small italic text-error-dark">
                            {errors.photos || errors['photos.0']}
                        </p>
                    )}
                </FormSection>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={processing}
                        iconLeft={!processing && <FiSave size={20} />}
                    >
                        {processing ? t('admin.common.updating') : t('admin.places.submit_edit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout pageTitle="Edit Destinasi" content={page} />
);
