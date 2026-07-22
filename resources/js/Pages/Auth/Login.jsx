import '@css/Auth/Login.css';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { GiPadlock } from 'react-icons/gi';
import Flash from '@components/Common/Flash';
import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";
import Checkbox from "@components/Forms/Checkbox";
import LanguageSwitcher from "@components/Common/LanguageSwitcher";
import { useTranslation } from '@js/i18n';
import { route } from 'ziggy-js';

export default function Login() {
    const amountBgImage = 5;
    const [currIdx, setCurrIdx] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [fade, setFade] = useState(true);
    const { flash } = usePage().props;
    const { t, tRaw } = useTranslation();

    // The background slides (name, location, description) come from the lang
    // files (account.login_slides).
    const slides = tRaw('account.login_slides', []);

    // Sisipkan brand "NuraLoka" berstyle ke tengah teks subtitle (mengandung :app).
    const subtitleParts = t('account.login.subtitle').split(':app');

    const { data, setData, post, processing, errors, reset } = useForm({
        'identity': '',
        'password': '',
        'rememberMe': false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        flash.type = null;
        flash.message = null;

        post(route('auth.login.authenticate'), {
            onSuccess: () => reset(),
        });
    };

    useEffect(() => {
        const slider = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setFade(true);

                setCurrIdx((prev) => {
                    if (prev == amountBgImage - 1) return 0;
                    else return prev + 1;
                });
            }, 750);
        }, 5000);

        return () => clearInterval(slider);
    }, []);

    const slide = slides[currIdx] || {};

    return (
        <>
            <Head>
                <title>{`NuraLoka | ${t('account.login.meta_title')}`}</title>

                <meta
                    name="description"
                    content={t('account.login.meta_description')}
                />
            </Head>

            <section className='login-section bg-gray-10'>
                {
                    (flash.type != null && flash.message != null) && (<Flash type={flash.type} message={flash.message}></Flash>)
                }
                <section className={`left-section ${(fade ? 'fade' : '')}`}>
                    <img src={`/images/background-auth/login/${currIdx + 1}.jpg`} alt="login-bg" className='login-bg' />
                    <div className='bg-desc'>
                        <div className='bg-main-content'>
                            <h2 className='text-white font-heading text-title'><b>{slide.name}</b></h2>
                            <p className='text-accent-10 text-body font-body'><i>{slide.loc}</i></p>
                        </div>
                        <p className={`${(currIdx == 2 ? 'white' : 'bg-additional-content')} font-body text-paragraph`}>{slide.desc}</p>
                    </div>
                </section>
                <section className='right-section'>
                    <div className='top-right-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle bg-primary-100'></div>
                            <div className='circle bg-primary-30'></div>
                            <div className='circle bg-primary-70'></div>
                        </div>
                    </div>
                    {/* Language picker for guests on the login page */}
                    <div className='absolute right-4 top-4 z-20'>
                        <LanguageSwitcher />
                    </div>
                    <div className='container overflow-auto h-full hide-scrollbar'>
                        <div className='text-body font-body mb-6'>
                            <p><b className='text-primary-100'>{t('account.login.welcome_greeting')}</b> {t('account.login.welcome_back')}</p>
                            <img src="/images/logo/with-tagline.png" alt="logo" className='w-52' />
                        </div>
                        <div className='main-content'>
                            <div className='mb-4'>
                                <h2 className='text-title font-heading text-primary-100'><b>{t('account.login.title')}</b></h2>
                                <p className='font-body text-body'>
                                    {subtitleParts[0]}
                                    <span className='nuraloka-text'><span className='nura'>Nura</span><span className='loka'>Loka</span></span>
                                    {subtitleParts[1]}
                                </p>
                            </div>
                            <form method="POST" className="w-full" onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-4 mb-2'>
                                    <Input
                                        label={t('account.login.identity_label')}
                                        name="identity"
                                        type="text"
                                        placeholder={t('account.login.identity_placeholder')}
                                        icon={<FaRegUserCircle size={26} />}
                                        value={data.identity ?? ""}
                                        onChange={(e) => setData("identity", e.target.value)}
                                        error={errors.identity}
                                    />

                                    <div className='w-full flex flex-col gap-1.5 items-end'>
                                        <Input
                                            autoComplete="off"
                                            label={t('account.login.password_label')}
                                            name="password"
                                            type="password"
                                            placeholder={t('account.login.password_placeholder')}
                                            icon={<GiPadlock size={26} />}
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            error={errors.password}
                                        />

                                        <Link href={route('auth.forget-password.index')}>
                                            {t('account.login.forgot_password')}
                                        </Link>
                                    </div>
                                </div>

                                <Checkbox
                                    id="rememberMe"
                                    name="rememberMe"
                                    label={t('account.login.remember_me')}
                                    checked={data.rememberMe}
                                    onChange={(e) => setData("rememberMe", e.target.checked)}
                                    className="mb-4"
                                />

                                <div className="d-flex flex-col w-full">
                                    <Button
                                        type="submit"
                                        variant={processing ? "inactive" : "primary"}
                                        loading={processing}
                                        fullWidth
                                        className="mb-3"
                                    >
                                        {processing ? t('account.login.submit_processing') : t('account.login.submit')}
                                    </Button>

                                    <a href={route("auth.google.login")} className="block">
                                        <Button
                                            type="button"
                                            variant="white"
                                            fullWidth
                                            iconLeft={
                                                <img
                                                    src="/images/icons/google.png"
                                                    alt="Google"
                                                    className="h-5 w-5"
                                                />
                                            }
                                        >
                                            {t('account.login.google')}
                                        </Button>
                                    </a>
                                </div>
                            </form>
                            <p className='text-body text-center mt-2'>{t('account.login.no_account')} <Link href={route('auth.register.index')}>{t('account.login.register_now')}</Link></p>
                        </div>
                    </div>
                    <div className='bottom-left-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle bg-primary-50'></div>
                            <div className='circle bg-primary-85'></div>
                        </div>
                    </div>
                </section>
            </section>
        </>
    );
};
