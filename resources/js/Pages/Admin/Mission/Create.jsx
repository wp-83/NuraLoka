import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';

import { FiAlertCircle, FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Create({ badges, categories = [], actions = [] }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        points_reward: 0,
        target: 1,
        badge_id: '',
        action_type: '',
        category_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.missions.store'));
    };

    const badgeOptions = badges ? badges.map((b) => ({ label: b.name, value: b.id })) : [];
    const actionOptions = actions.map((a) => ({ label: a.label, value: a.value }));
    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    // Category filter only applies to place-based actions (checkin/save_place).
    const selectedAction = actions.find((a) => String(a.value) === String(data.action_type));
    const showCategory = selectedAction?.category;

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.missions.create_title')}
                description={t('admin.missions.create_description')}
            />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        type="button"
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.missions.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Challenge Information */}
                <FormSection
                    title={t('admin.missions.section_info_title')}
                    description={t('admin.missions.section_info_description_create')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.missions.label_title')}
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('admin.missions.placeholder_title')}
                            error={errors.title}
                            required
                        />

                        <Input
                            type="textarea"
                            rows={4}
                            label={t('admin.missions.label_description')}
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('admin.missions.placeholder_description')}
                            error={errors.description}
                            required
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                type="number"
                                min="0"
                                label={t('admin.missions.label_points_reward')}
                                name="points_reward"
                                value={data.points_reward}
                                onChange={(e) => setData('points_reward', e.target.value)}
                                placeholder={t('admin.missions.placeholder_points_reward')}
                                error={errors.points_reward}
                                required
                            />

                            <Input
                                type="number"
                                min="1"
                                label={t('admin.missions.label_target')}
                                name="target"
                                value={data.target}
                                onChange={(e) => setData('target', e.target.value)}
                                placeholder={t('admin.missions.placeholder_target')}
                                error={errors.target}
                                required
                            />
                        </div>
                    </div>
                </FormSection>

                {/* Trigger Action */}
                <FormSection
                    title={t('admin.missions.section_action_title')}
                    description={t('admin.missions.section_action_description')}
                >
                    <div className="flex flex-col gap-4">
                        <Dropdown
                            label={t('admin.missions.label_action_type')}
                            name="action_type"
                            value={data.action_type}
                            onChange={(e) => setData('action_type', e.target.value)}
                            options={actionOptions}
                            error={errors.action_type}
                        />

                        {showCategory && (
                            <div>
                                <Dropdown
                                    label={t('admin.missions.label_category_filter')}
                                    name="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    options={categoryOptions}
                                    placeholder={t('admin.missions.placeholder_category_filter')}
                                    error={errors.category_id}
                                />

                                <p className="mt-1 font-body text-micro text-gray-50">
                                    {t('admin.missions.category_filter_hint')}
                                </p>
                            </div>
                        )}
                    </div>
                </FormSection>

                {/* Badge */}
                <FormSection
                    title={t('admin.missions.section_badge_title')}
                    description={t('admin.missions.section_badge_description')}
                >
                    <Dropdown
                        label={t('admin.missions.label_badge')}
                        name="badge_id"
                        value={data.badge_id}
                        onChange={(e) => setData('badge_id', e.target.value)}
                        options={badgeOptions}
                        placeholder={t('admin.missions.placeholder_badge')}
                        error={errors.badge_id}
                        required
                    />

                    {badges && badges.length === 0 && (
                        <p className="mt-2 inline-flex items-center gap-1 font-body text-small italic text-error-dark">
                            <FiAlertCircle /> {t('admin.missions.no_badges_available')}
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
                        {processing ? t('admin.common.saving') : t('admin.missions.submit_create')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Create.layout = (page) => (
    <AdminLayout pageTitle="Tambah Tantangan" content={page} />
);
