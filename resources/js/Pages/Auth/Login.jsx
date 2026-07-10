import '@css/Auth/Login.css';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { GiPadlock } from 'react-icons/gi';
import Flash from '@components/Common/Flash';
import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";
import Checkbox from "@components/Forms/Checkbox";
import { route } from 'ziggy-js';

export default function Login() {
    const amountBgImage = 5;
    const [currIdx, setCurrIdx] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [fade, setFade] = useState(true);
    const { flash } = usePage().props;

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

    const bgIdentity = {
        'name': [
            'Candi Borobudur',
            'Gunung Kerinci',
            'Papeda',
            'Proses Tenun Tradisional',
            'Kilometer 0 Indonesia',
        ],
        'loc': [
            'Magelang, Jawa Tengah',
            'Kerinci, Jambi',
            'Jayapura, Papua',
            'Sikka, Nusa Tenggara Timur',
            'Sabang, Aceh',
        ],
        'desc': [
            'Candi Buddha terbesar di dunia dengan stupa khas dan situs warisan UNESCO.',
            'Gunung tertinggi di Sumatra dengan lanskap megah dan sering diselimuti kabut.',
            'Makanan khas berbahan sagu bertekstur kental, biasanya disajikan dengan kuah ikan.',
            'Proses menenun kain dengan alat tradisional menggunakan benang berwarna, menghasilkan motif khas daerah.',
            'Monumen penanda titik nol kilometer Indonesia sebagai batas paling barat NKRI.',
        ],
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

    return (
        <>
            <Head>
                <title>NuraLoka | Masuk Akun</title>

                <meta
                    name="description"
                    content="Temukan rekomendasi tempat wisata, kuliner, dan lokasi persinggahan terbaik di sepanjang rute perjalanan antar kota di Indonesia bersama NuraLoka."
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
                            <h2 className='text-white font-heading text-title'><b>{bgIdentity.name[currIdx]}</b></h2>
                            <p className='text-accent-10 text-body font-body'><i>{bgIdentity.loc[currIdx]}</i></p>
                        </div>
                        <p className={`${(currIdx == 2 ? 'white' : 'bg-additional-content')} font-body text-paragraph`}>{bgIdentity.desc[currIdx]}</p>
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
                    <div className='container overflow-auto h-full hide-scrollbar'>
                        <div className='text-body font-body mb-6'>
                            <p><b className='text-primary-100'>Hi, Nuravers!</b> Selamat datang kembali di</p>
                            <img src="/images/logo/with-tagline.png" alt="logo" className='w-52' />
                        </div>
                        <div className='main-content'>
                            <div className='mb-4'>
                                <h2 className='text-title font-heading text-primary-100'><b>Masuk Akun</b></h2>
                                <p className='font-body text-body'>Ayo masuk ke akun Anda untuk eksplorasi Indonesia bersama <span className='nuraloka-text'><span className='nura'>Nura</span><span className='loka'>Loka</span></span>!</p>
                            </div>
                            <form method="POST" className="w-full" onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-4 mb-2'>
                                    <Input
                                        label="Email atau Username"
                                        name="identity"
                                        type="text"
                                        placeholder="email.kamu@gmail.com"
                                        icon={<FaRegUserCircle size={26} />}
                                        value={data.identity ?? ""}
                                        onChange={(e) => setData("identity", e.target.value)}
                                        error={errors.identity}
                                    />

                                    <div className='w-full flex flex-col gap-1.5 items-end'>
                                        <Input
                                            autoComplete="off"
                                            label="Kata Sandi"
                                            name="password"
                                            type="password"
                                            placeholder="Kata sandi kamu"
                                            icon={<GiPadlock size={26} />}
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            error={errors.password}
                                        />

                                        <Link href={route('auth.forget-password.index')}>
                                            Lupa kata sandi?
                                        </Link>
                                    </div>
                                </div>

                                <Checkbox
                                    id="rememberMe"
                                    name="rememberMe"
                                    label="Ingat Saya untuk 30 Hari Ke Depan"
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
                                        {processing ? "Memeriksa data..." : "Masuk"}
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
                                            Masuk dengan Google
                                        </Button>
                                    </a>
                                </div>
                            </form>
                            <p className='text-body text-center mt-2'>Belum punya akun? <Link href={route('auth.register.index')}>Daftar Sekarang!</Link></p>
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
