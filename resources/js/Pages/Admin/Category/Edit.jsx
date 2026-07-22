import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';
import { categoryIconUrl } from '@js/categoryIcons';

import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiArrowLeft,
    FiSave,
    FiSearch,
    FiTrash2,
    FiUpload,
} from 'react-icons/fi';

export default function Edit({ category }) {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(categoryIconUrl(category) || null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: category.name || '',
        icon_path: null,
        remove_icon: false,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData((d) => ({ ...d, icon_path: file, remove_icon: false }));
        setPreviewUrl(file ? URL.createObjectURL(file) : categoryIconUrl(category) || null);
    };

    const handleRemoveIcon = () => {
        setData((d) => ({ ...d, icon_path: null, remove_icon: true }));
        setPreviewUrl(null);
        const fileInput = document.getElementById('icon-file');
        if (fileInput) fileInput.value = '';
    };

    const triggerFileInput = () => {
        document.getElementById('icon-file')?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.update', category.slug));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.categories.edit_title')}
                description={t('admin.categories.edit_description', { name: category.name })}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.categories.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Category Information */}
                <FormSection
                    title={t('admin.categories.section_info_title')}
                    description={t('admin.categories.section_info_description_edit')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.categories.label_name')}
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('admin.categories.placeholder_name')}
                            error={errors.name}
                            required
                        />

                        {/* Icon Upload */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-heading text-paragraph text-primary-100">
                                {t('admin.categories.label_icon')}
                            </label>

                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                {/* Preview Box */}
                                <div
                                    className={[
                                        'group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-10',
                                        errors.icon_path
                                            ? 'border-error-dark'
                                            : 'border-primary-30',
                                        !previewUrl && 'cursor-pointer hover:bg-secondary-10',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={!previewUrl ? triggerFileInput : undefined}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img
                                                src={previewUrl}
                                                alt={t('admin.categories.label_icon')}
                                                className="h-full w-full object-contain p-2"
                                                onError={(e) => {
                                                    e.target.src = '/images/defaults/image.png';
                                                }}
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    unstyled
                                                    onClick={() => setIsPreviewOpen(true)}
                                                    title={t('admin.categories.icon_view')}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-100 hover:opacity-80"
                                                >
                                                    <FiSearch size={16} />
                                                </Button>

                                                <Button
                                                    unstyled
                                                    onClick={handleRemoveIcon}
                                                    title={t('admin.categories.icon_remove')}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-error-dark hover:opacity-80"
                                                >
                                                    <FiTrash2 size={16} />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="px-2 text-center font-body text-micro italic text-gray-50">
                                            {t('admin.categories.icon_empty')}
                                        </span>
                                    )}
                                </div>

                                {/* File Picker */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        id="icon-file"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="white"
                                            size="btn-sm"
                                            iconLeft={<FiUpload size={16} />}
                                            onClick={triggerFileInput}
                                        >
                                            {t('admin.categories.icon_choose_new')}
                                        </Button>

                                        <span className="max-w-[12rem] truncate font-body text-small text-gray-70">
                                            {data.icon_path
                                                ? data.icon_path.name
                                                : t('admin.categories.icon_current_file')}
                                        </span>
                                    </div>

                                    <span className="font-body text-micro text-gray-50">
                                        {t('admin.categories.icon_hint_edit')}
                                    </span>
                                </div>
                            </div>

                            {errors.icon_path && (
                                <p className="font-body text-small italic text-error-dark">
                                    {errors.icon_path}
                                </p>
                            )}
                        </div>
                    </div>
                </FormSection>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={processing}
                        iconLeft={!processing && <FiSave size={20} />}
                    >
                        {processing ? t('admin.common.updating') : t('admin.categories.submit_edit')}
                    </Button>
                </div>
            </form>

            {/* Image preview overlay */}
            {isPreviewOpen && previewUrl && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <Button
                            unstyled
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-100 shadow-md hover:opacity-80"
                        >
                            &times;
                        </Button>

                        <img
                            src={previewUrl}
                            alt={t('admin.categories.label_icon')}
                            className="max-h-[80vh] max-w-[80vw] rounded-lg bg-white object-contain p-4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout pageTitle="title.admin_category_edit" content={page} />
);
