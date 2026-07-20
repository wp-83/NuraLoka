import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiArrowLeft,
    FiSave,
    FiSearch,
    FiTrash2,
    FiUpload,
} from 'react-icons/fi';

// Format a datetime string for the datetime-local input.
function formatDateTimeLocal(dateString) {
    if (!dateString) return '';

    const d = new Date(dateString);
    const pad = (num) => String(num).padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Edit({ newsItem }) {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(newsItem.thumbnail || null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: newsItem.title || '',
        content: newsItem.content || '',
        publish_date: formatDateTimeLocal(newsItem.publish_date),
        thumbnail: null,
        remove_thumbnail: false,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData((d) => ({ ...d, thumbnail: file, remove_thumbnail: false }));
        setPreviewUrl(file ? URL.createObjectURL(file) : newsItem.thumbnail || null);
    };

    const handleRemoveImage = () => {
        setData((d) => ({ ...d, thumbnail: null, remove_thumbnail: true }));
        setPreviewUrl(null);
        const fileInput = document.getElementById('thumbnail-file');
        if (fileInput) fileInput.value = '';
    };

    const triggerFileInput = () => {
        document.getElementById('thumbnail-file')?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.news.update', newsItem.slug));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.news.edit_title')}
                description={t('admin.news.edit_description', { title: newsItem.title })}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        type="button"
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.news.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Article Information */}
                <FormSection
                    title={t('admin.news.section_info_title')}
                    description={t('admin.news.section_info_description')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.news.label_title')}
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('admin.news.placeholder_title')}
                            error={errors.title}
                            required
                        />

                        <Input
                            label={t('admin.news.label_publish_date')}
                            name="publish_date"
                            type="datetime-local"
                            value={data.publish_date}
                            onChange={(e) => setData('publish_date', e.target.value)}
                            error={errors.publish_date}
                            required
                        />
                    </div>
                </FormSection>

                {/* Thumbnail */}
                <FormSection
                    title={t('admin.news.section_thumbnail_title')}
                    description={t('admin.news.section_thumbnail_description_edit')}
                >
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        {/* Preview Box */}
                        <div
                            className={[
                                'group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-10',
                                errors.thumbnail ? 'border-error-dark' : 'border-primary-30',
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
                                        alt={t('admin.news.section_thumbnail_title')}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/images/defaults/image.png';
                                        }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsPreviewOpen(true)}
                                            title={t('admin.news.thumbnail_view')}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-100 hover:opacity-80"
                                        >
                                            <FiSearch size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            title={t('admin.news.thumbnail_remove')}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-error-dark hover:opacity-80"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <span className="px-2 text-center font-body text-micro italic text-gray-50">
                                    {t('admin.news.thumbnail_empty')}
                                </span>
                            )}
                        </div>

                        {/* File Picker */}
                        <div className="flex flex-col gap-2">
                            <input
                                id="thumbnail-file"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="white"
                                    size="btn-sm"
                                    iconLeft={<FiUpload size={16} />}
                                    onClick={triggerFileInput}
                                >
                                    {t('admin.news.thumbnail_change')}
                                </Button>

                                <span className="max-w-[12rem] truncate font-body text-small text-gray-70">
                                    {data.thumbnail ? data.thumbnail.name : t('admin.news.thumbnail_current_file')}
                                </span>
                            </div>

                            <span className="font-body text-micro text-gray-50">
                                {t('admin.news.thumbnail_hint_edit')}
                            </span>
                        </div>
                    </div>

                    {errors.thumbnail && (
                        <p className="mt-2 font-body text-small italic text-error-dark">
                            {errors.thumbnail}
                        </p>
                    )}
                </FormSection>

                {/* Content */}
                <FormSection
                    title={t('admin.news.section_content_title')}
                    description={t('admin.news.section_content_description')}
                >
                    <Input
                        label={t('admin.news.label_content')}
                        name="content"
                        type="textarea"
                        rows={8}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder={t('admin.news.placeholder_content')}
                        error={errors.content}
                        required
                    />
                </FormSection>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={processing}
                        iconLeft={!processing && <FiSave size={20} />}
                    >
                        {processing ? t('admin.common.updating') : t('admin.news.submit_edit')}
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
                        <button
                            type="button"
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-100 shadow-md hover:opacity-80"
                        >
                            &times;
                        </button>

                        <img
                            src={previewUrl}
                            alt={t('admin.news.section_thumbnail_title')}
                            className="max-h-[80vh] max-w-[80vw] rounded-lg bg-white object-contain p-4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout pageTitle="Edit Wawasan Wisata" content={page} />
);
