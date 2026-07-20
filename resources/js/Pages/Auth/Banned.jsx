import Button from '@components/Forms/Button';
import LanguageSwitcher from '@components/Common/LanguageSwitcher';
import { useTranslation } from '@js/i18n';

import { Head, router } from '@inertiajs/react';
import { CiLock } from 'react-icons/ci';

export default function Banned() {
    const { t } = useTranslation();

    const handleLogout = () => {
        router.post(route('auth.logout'));
    };

    return (
        <>
            <Head>
                <title>{`NuraLoka | ${t('account.banned.meta_title')}`}</title>
            </Head>

            <main className="relative flex min-h-screen items-center justify-center bg-gray-10 px-6">
                <div className="absolute right-6 top-6 z-30">
                    <LanguageSwitcher />
                </div>
                <div className="flex max-w-2xl flex-col items-center text-center">
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-error-light">
                        <CiLock size={48} className="text-error-dark" />
                    </div>

                    <h1 className="mb-3 text-title font-bold font-heading text-error-dark">
                        {t('account.banned.title')}
                    </h1>

                    <p className="mb-8 max-w-lg text-body leading-relaxed text-gray-100">
                        {t('account.banned.desc')}
                    </p>

                    <Button onClick={handleLogout}>
                        {t('account.banned.back_home')}
                    </Button>
                </div>
            </main>
        </>
    );
}
