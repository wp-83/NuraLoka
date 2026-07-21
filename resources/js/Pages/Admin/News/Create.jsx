import BrandText from '@components/Common/BrandText';
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

export default function Create() {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        publish_date: '',
        thumbnail: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('thumbnail', file);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleRemoveImage = () => {
        setData('thumbnail', null);
        setPreviewUrl(null);
        const fileInput = document.getElementById('thumbnail-file');
        if (fileInput) fileInput.value = '';
    };

    const triggerFileInput = () => {
        document.getElementById('thumbnail-file')?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.news.store'));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.news.create_title')}
                description={<BrandText text={t('admin.news.create_description')} />}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
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
                    description={t('admin.news.section_thumbnail_description_create')}
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
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            unstyled
                                            onClick={() => setIsPreviewOpen(true)}
                                            title={t('admin.news.thumbnail_view')}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-100 hover:opacity-80"
                                        >
                                            <FiSearch size={16} />
                                        </Button>

                                        <Button
                                            unstyled
                                            onClick={handleRemoveImage}
                                            title={t('admin.news.thumbnail_remove')}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-error-dark hover:opacity-80"
                                        >
                                            <FiTrash2 size={16} />
                                        </Button>
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
                                    variant="white"
                                    size="btn-sm"
                                    iconLeft={<FiUpload size={16} />}
                                    onClick={triggerFileInput}
                                >
                                    {t('admin.news.thumbnail_choose')}
                                </Button>

                                <span className="max-w-[12rem] truncate font-body text-small text-gray-70">
                                    {data.thumbnail ? data.thumbnail.name : t('admin.news.thumbnail_no_file')}
                                </span>
                            </div>

                            <span className="font-body text-micro text-gray-50">
                                {t('admin.news.thumbnail_hint')}
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
                        {processing ? t('admin.common.saving') : t('admin.news.submit_create')}
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
                            alt={t('admin.news.section_thumbnail_title')}
                            className="max-h-[80vh] max-w-[80vw] rounded-lg bg-white object-contain p-4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

Create.layout = (page) => (
    <AdminLayout pageTitle="title.admin_news_create" content={page} />
);
