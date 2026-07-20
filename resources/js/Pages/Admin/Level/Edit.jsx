import FormSection from '@components/Common/FormSection';
import PageHeader from '@components/Common/PageHeader';
import Button from '@components/Forms/Button';
import Input from '@components/Forms/Input';
import AdminLayout from '@js/Layouts/AdminLayout';
import { useTranslation } from '@js/i18n';

import { router, useForm } from '@inertiajs/react';

import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Edit({ level }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        name: level.name || '',
        min_points: level.min_points ?? 0,
        order: level.order ?? 1,
        _method: 'POST',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.levels.update', level.slug));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                title={t('admin.levels.edit_title')}
                description={t('admin.levels.edit_description', { name: level.name })}
            />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Back */}
                <div>
                    <Button
                        type="button"
                        variant="white"
                        iconLeft={<FiArrowLeft size={18} />}
                        onClick={() => router.get(route('admin.levels.index'))}
                    >
                        {t('admin.common.back')}
                    </Button>
                </div>

                {/* Level Information */}
                <FormSection
                    title={t('admin.levels.section_info_title')}
                    description={t('admin.levels.section_info_description_edit')}
                >
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t('admin.levels.label_name')}
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                type="number"
                                min="0"
                                label={t('admin.levels.label_min_points')}
                                name="min_points"
                                value={data.min_points}
                                onChange={(e) => setData('min_points', e.target.value)}
                                helperText={t('admin.levels.min_points_hint')}
                                error={errors.min_points}
                                required
                            />

                            <Input
                                type="number"
                                min="1"
                                label={t('admin.levels.label_order')}
                                name="order"
                                value={data.order}
                                onChange={(e) => setData('order', e.target.value)}
                                error={errors.order}
                                required
                            />
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
                        {processing ? t('admin.common.saving') : t('admin.levels.submit_edit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page) => (
    <AdminLayout pageTitle="Edit Level" content={page} />
);
