import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Checkbox from '@components/Forms/Checkbox';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';

import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Create({ categories }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        min_price: '',
        max_price: '',
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
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.places.create_title')}
                description={t('admin.places.create_description')}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
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

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                label={t('admin.places.label_min_price')}
                                name="min_price"
                                type="number"
                                min="0"
                                value={data.min_price}
                                onChange={(e) => setData('min_price', e.target.value)}
                                placeholder={t('admin.places.placeholder_min_price')}
                                error={errors.min_price}
                            />

                            <Input
                                label={t('admin.places.label_max_price')}
                                name="max_price"
                                type="number"
                                min="0"
                                value={data.max_price}
                                onChange={(e) => setData('max_price', e.target.value)}
                                placeholder={t('admin.places.placeholder_max_price')}
                                error={errors.max_price}
                            />
                        </div>
                    </div>
                </FormSection>

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
                            {t('admin.places.no_categories_available')}{' '}
                            <Button
                                unstyled
                                onClick={() => router.get(route('admin.categories.create'))}
                                className="font-semibold text-primary-100 underline"
                            >
                                {t('admin.places.add_category_first')}
                            </Button>
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
                    title={t('admin.places.section_photos_title')}
                    description={t('admin.places.section_photos_description_create')}
                >
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
                                    className="h-24 w-full rounded-lg object-cover"
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
                        {processing ? t('admin.common.saving') : t('admin.places.submit_create')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Create.layout = (page) => (
    <AdminLayout pageTitle="title.admin_place_create" content={page} />
);
