import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Checkbox from '@components/Forms/Checkbox';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import { FiArrowLeft, FiSave, FiUpload } from 'react-icons/fi';

export default function Edit({ badge }) {
    const { t } = useTranslation();

    const TYPE_OPTIONS = [
        { value: 'general', label: t('admin.badges.type_option_general') },
        { value: 'special', label: t('admin.badges.type_option_special') },
    ];

    const TIER_OPTIONS = [
        { value: 0, label: t('admin.badges.tier_option_none') },
        { value: 1, label: `1 · ${t('admin.badges.tier_bronze')}` },
        { value: 2, label: `2 · ${t('admin.badges.tier_silver')}` },
        { value: 3, label: `3 · ${t('admin.badges.tier_gold')}` },
        { value: 4, label: `4 · ${t('admin.badges.tier_diamond')}` },
    ];

    const currentIcon = badge.icon_path
        ? badge.icon_path.startsWith('http')
            ? badge.icon_path
            : `/${badge.icon_path}`
        : null;

    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: badge.name || '',
        requirement_description: badge.requirement_description || '',
        type: badge.type || 'general',
        category: badge.category || '',
        points: badge.points ?? 0,
        tier_level: badge.tier_level ?? 0,
        tier_target: badge.tier_target ?? 0,
        icon_path: null,
        remove_icon: false,
        _method: 'POST',
    });

    const handleFile = (e) => {
        const file = e.target.files[0];
        setData('icon_path', file);
        setData('remove_icon', false);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.badges.update', badge.slug));
    };

    const shownIcon = preview || (data.remove_icon ? null : currentIcon);

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.badges.edit_title')}
                description={t('admin.badges.edit_description', { name: badge.name })}
            />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        type="button"
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.badges.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Badge Information */}
                <FormSection
                    title={t('admin.badges.section_info_title')}
                    description={t('admin.badges.section_info_description_edit')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.badges.label_name')}
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <Input
                            type="textarea"
                            rows={3}
                            label={t('admin.badges.label_requirement')}
                            name="requirement_description"
                            value={data.requirement_description}
                            onChange={(e) =>
                                setData('requirement_description', e.target.value)
                            }
                            error={errors.requirement_description}
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Dropdown
                                label={t('admin.badges.label_type')}
                                name="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                options={TYPE_OPTIONS}
                                error={errors.type}
                                required
                            />

                            <Input
                                label={t('admin.badges.label_category')}
                                name="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                error={errors.category}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <Input
                                type="number"
                                min="0"
                                label={t('admin.badges.label_points')}
                                name="points"
                                value={data.points}
                                onChange={(e) => setData('points', e.target.value)}
                                error={errors.points}
                                required
                            />

                            <Dropdown
                                label={t('admin.badges.label_tier_level')}
                                name="tier_level"
                                value={data.tier_level}
                                onChange={(e) => setData('tier_level', e.target.value)}
                                options={TIER_OPTIONS}
                                error={errors.tier_level}
                            />

                            <Input
                                type="number"
                                min="0"
                                label={t('admin.badges.label_tier_target')}
                                name="tier_target"
                                value={data.tier_target}
                                onChange={(e) => setData('tier_target', e.target.value)}
                                error={errors.tier_target}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* Badge Icon */}
                <FormSection
                    title={t('admin.badges.section_icon_title')}
                    description={t('admin.badges.section_icon_description_edit')}
                >
                    <div className="flex items-center gap-4">
                        {shownIcon ? (
                            <img
                                src={shownIcon}
                                alt={t('admin.badges.section_icon_title')}
                                className="h-24 w-24 shrink-0 object-contain"
                            />
                        ) : (
                            <span className="font-body text-small italic text-gray-50">
                                {t('admin.badges.icon_empty_edit')}
                            </span>
                        )}

                        <div className="flex flex-col gap-2">
                            <input
                                id="badge-icon"
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                className="hidden"
                            />

                            <Button
                                type="button"
                                variant="white"
                                size="btn-sm"
                                iconLeft={<FiUpload size={16} />}
                                onClick={() => document.getElementById('badge-icon')?.click()}
                            >
                                {t('admin.badges.icon_change')}
                            </Button>

                            {currentIcon && (
                                <Checkbox
                                    id="remove_icon"
                                    name="remove_icon"
                                    label={t('admin.badges.icon_remove_current')}
                                    checked={data.remove_icon}
                                    onChange={(e) => {
                                        setData('remove_icon', e.target.checked);

                                        if (e.target.checked) {
                                            setData('icon_path', null);
                                            setPreview(null);
                                        }
                                    }}
                                />
                            )}

                            <span className="font-body text-micro text-gray-50">
                                {t('admin.badges.icon_hint_edit')}
                            </span>
                        </div>
                    </div>

                    {errors.icon_path && (
                        <p className="mt-2 font-body text-small italic text-error-dark">
                            {errors.icon_path}
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
                        {processing ? t('admin.common.saving') : t('admin.badges.submit_edit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout pageTitle="title.admin_badge_edit" content={page} />
);
