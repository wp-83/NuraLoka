import Button from '@components/Forms/Button';
import LanguageSwitcher from '@components/Common/LanguageSwitcher';
import { useTranslation } from '@js/i18n';
import { Link, Head } from '@inertiajs/react';
import { IoChevronBackCircleOutline } from 'react-icons/io5';

export default function ForgetPasswordSuccess() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`NuraLoka | ${t('account.forget.meta_title')}`} />

            <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gray-10 px-6">

                <div className="absolute right-6 top-6 z-30">
                    <LanguageSwitcher />
                </div>

                <section className="flex w-full flex-col items-center">

                    <img
                        src="/images/logo/with-tagline.png"
                        alt="Logo"
                        className="mb-5 mt-4 w-48"
                    />

                    <h1 className="mb-1 text-title font-heading font-bold text-center text-primary-100">
                        {t('account.forget_success.title')}
                    </h1>

                    <p className="mb-8 max-w-2xl text-center text-paragraph">
                        {t('account.forget_success.desc')}
                    </p>

                    <Link href={route('auth.login.index')}>
                        <Button iconLeft={<IoChevronBackCircleOutline size={28} />}>{t('account.forget_success.back_to_login')}</Button>
                    </Link>
                </section>
            </main>
        </>
    );
}
