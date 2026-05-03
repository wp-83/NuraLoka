import '@css/Init.css';
import '@css/Auth/Login.css';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import { GiPadlock } from 'react-icons/gi';

// SEO, error message and field style, flash wrong
export default function Login() {
    const amountBgImage = 5;
    const [currIdx, setCurrIdx] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [fade, setFade] = useState(true);

    const bgIdentity = {
        'name' : [
            'Candi Borobudur',
            'Gunung Kerinci',
            'Papeda',
            'Proses Tenun Tradisional',
            'Kilometer 0 Indonesia',
        ],
        'loc' : [
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
                <title>NuraLoka | Login</title>

                <meta
                    name="description"
                    content="Temukan rekomendasi tempat wisata, kuliner, dan lokasi persinggahan terbaik di sepanjang rute perjalanan antar kota di Indonesia bersama NuraLoka."
                />
            </Head>

            <section className='login-section'>
                <section className={`left-section ${(fade ? 'fade' : '')}`}>
                    <img src={`/images/background-auth/login/${currIdx+1}.jpg`} alt="login-bg" className='login-bg' />
                    <div className='bg-desc'>
                        <div className='bg-main-content'>
                            <h2><b>{bgIdentity.name[currIdx]}</b></h2>
                            <p><i>{bgIdentity.loc[currIdx]}</i></p>
                        </div>
                        <p className={`${(currIdx == 2 ? 'white' : 'bg-additional-content')}`}>{bgIdentity.desc[currIdx]}</p>
                    </div>
                </section>
                <section className='right-section'>
                    <div className='top-right-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle'></div>
                            <div className='circle'></div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='container login-container'>
                        <div className='header-content'>
                            <p><b>Hi, Nuravers!</b> Selamat datang kembali di</p>
                            <img src="/images/logo/with-tagline.png" alt="logo" className='logo-auth' />
                        </div>
                        <div className='main-content'>
                            <div className='page-context'>
                                <h2><b>Masuk Akun</b></h2>
                                <p>Ayo masuk ke akun Anda untuk eksplorasi Indonesia bersama <span className='nuraloka-text'><span>Nura</span><span>Loka</span></span>!</p>
                            </div>
                            <form className='login-form'>
                                <div className='input-group'>
                                    <label htmlFor="identity">Email atau Username</label>
                                    <div className='input-wrapper'>
                                        <div className='illustration-icon'>
                                            <FaRegUserCircle className='icon' />
                                        </div>
                                        <input type="text" placeholder='email.kamu@gmail.com' id='identity' name='identity' autoComplete='off' />
                                    </div>
                                </div>
                                <div className='input-group'>
                                    <label htmlFor="password">Kata Sandi</label>
                                    <div className='input-wrapper'>
                                        <div className='illustration-icon'>
                                            <GiPadlock className='icon' />
                                        </div>
                                        <input type={(showPass) ? 'text' : 'password'} placeholder='Kata sandi kamu' id='password' name='password' />
                                        <div className='passHideBtn' onClick={() => setShowPass((prev) => !prev)}>
                                            {
                                                (showPass) ? (
                                                    <FaEye className='icon' />
                                                ) : (
                                                    <FaEyeSlash className='icon' />
                                                )
                                            }
                                        </div>
                                    </div>
                                    <a href="" className='forget-password-container'>Lupa kata sandi?</a>
                                </div>
                                <label htmlFor="rememberMe" className='checkbox'>
                                    <span className='box'></span>
                                    <input type="checkbox" name="rememberMe" id="rememberMe" />
                                    <p className='content-label'>Ingat Saya untuk 30 Hari Ke Depan</p>
                                </label>
                                <div className='login-btn-container'>
                                    <button className='btn-primary'>Masuk</button>
                                    <button className='btn-white google-login-btn'>
                                        <img src="/images/icons/google.png" alt="google-icon" />
                                        <p>Masuk dengan Google</p>
                                    </button>
                                </div>
                            </form>
                            <p className='footer-content'>Belum punya akun? <Link href={route('auth.register.index')}>Daftar Sekarang!</Link></p>
                        </div>
                    </div>
                    <div className='bottom-left-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle'></div>
                            <div className='circle'></div>
                        </div>
                    </div>
                </section>
            </section>
        </>
    );
};
