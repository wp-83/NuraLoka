import Button from '@components/Forms/Button';
import LanguageSwitcher from '@components/Common/LanguageSwitcher';
import { useTranslation } from '@js/i18n';

import { router } from '@inertiajs/react';
import { MdBlock } from 'react-icons/md';

export default function Banned() {
    const { t } = useTranslation();

    const handleLogout = () => {
        router.post(route('auth.logout'));
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-gray-10 px-6">
            <div className="absolute right-6 top-6 z-30">
                <LanguageSwitcher />
            </div>
            <div className="flex max-w-lg flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-error-light">
                    <MdBlock className="text-5xl text-error-dark" />
                </div>

                <h1 className="mb-3 text-title font-bold text-gray-100">
                    {t('account.banned.title')}
                </h1>

                <p className="mb-8 text-body leading-relaxed text-gray-60">
                    {t('account.banned.desc')}
                </p>

                <Button onClick={handleLogout}>
                    {t('account.banned.back_home')}
                </Button>
            </div>
        </main>
    );
}
