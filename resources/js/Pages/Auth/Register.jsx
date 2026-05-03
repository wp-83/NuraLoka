import '@css/Init.css';
import '@css/Auth/Register.css';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';

// SEO, error message and field style, flash wrong
export default function Register() {
    const amountBgImage = 5;
    const [currIdx, setCurrIdx] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);
    const [fade, setFade] = useState(true);

    const bgIdentity = {
        'name' : [
            'Raja Ampat',
            'Tugu Khatulistiwa',
            'Garang Asem Ayam',
            'Mie Celor',
            'Proses Canting Batik Tulis',
        ],
        'loc' : [
            'Kabupaten Raja Ampat (Waisai), Papua Barat Daya',
            'Pontianak, Kalimantan Barat',
            'Semarang, Jawa Tengah',
            'Palembang, Sumatera Selatan',
            'Surakarta, Jawa Tengah',
        ],
        'desc': [
            'Gugusan pulau karst dengan laut jernih, dikenal sebagai salah satu destinasi wisata bahari terbaik di dunia.',
            'Monumen penanda garis khatulistiwa (0° lintang) yang menjadi ikon kota dan objek wisata edukasi.',
            'Hidangan ayam berkuah asam segar dengan cabai dan belimbing wuluh, biasanya dimasak dalam bungkus daun pisang.',
            'Mie khas dengan kuah kental berbasis santan/udang, disajikan dengan telur, tauge, dan bawang goreng.',
            'Menorehkan malam (lilin panas) pada kain dengan canting untuk membentuk motif secara manual.',
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
                <title>NuraLoka | Register</title>

                <meta
                    name="description"
                    content="Temukan rekomendasi tempat wisata, kuliner, dan lokasi persinggahan terbaik di sepanjang rute perjalanan antar kota di Indonesia bersama NuraLoka."
                />
            </Head>

            <section className='register-section'>
                <section className='left-section'>
                    <div className='top-left-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle'></div>
                            <div className='circle'></div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='container register-container'>
                        <div className='header-content'>
                            <p><b>Hi, Nuravers!</b> Selamat datang di</p>
                            <img src="/images/logo/with-tagline.png" alt="logo" className='logo-auth' />
                        </div>
                        <div className='main-content'>
                            <div className='page-context'>
                                <h2><b>Daftar Akun</b></h2>
                                <p>Segera jadi bagian langsung dari <span className='nuraloka-text'><span>Nura</span><span>Loka</span></span>!</p>
                            </div>
                            <form className='register-form'>
                                <div className='input-group'>
                                    <label htmlFor="username">Username</label>
                                    <div className='input-wrapper'>
                                        <div className='illustration-icon'>
                                            <FaRegUserCircle className='icon' />
                                        </div>
                                        <input type="text" placeholder='kocakbanget123' id='username' name='username' autoComplete='off' />
                                    </div>
                                </div>
                                <div className='input-group'>
                                    <label htmlFor="email">Email</label>
                                    <div className='input-wrapper'>
                                        <div className='illustration-icon'>
                                            <MdOutlineMail className='icon' />
                                        </div>
                                        <input type="text" placeholder='email.kamu@gmail.com' id='email' name='email' autoComplete='off' />
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
                                </div>
                                <div className='input-group'>
                                    <label htmlFor="passwordConfirm">Konfirmasi Kata Sandi</label>
                                    <div className='input-wrapper'>
                                        <div className='illustration-icon'>
                                            <GiPadlock className='icon' />
                                        </div>
                                        <input type={(showPassConfirm) ? 'text' : 'password'} placeholder='Konfirmasi kata sandi kamu' id='passwordConfirm' name='passwordConfirm' />
                                        <div className='passHideBtn' onClick={() => setShowPassConfirm((prev) => !prev)}>
                                            {
                                                (showPassConfirm) ? (
                                                    <FaEye className='icon' />
                                                ) : (
                                                    <FaEyeSlash className='icon' />
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className='register-btn-container'>
                                    <button className='btn-primary'>Daftar Akun</button>
                                    <button className='btn-white google-register-btn'>
                                        <img src="/images/icons/google.png" alt="google-icon" />
                                        <p>Daftar dengan Google</p>
                                    </button>
                                </div>
                            </form>
                            <p className='footer-content'>Sudah punya akun? <Link href={route('auth.login.index')}>Masuk Sekarang!</Link></p>
                        </div>
                    </div>
                    <div className='bottom-right-decoration'>
                        <div className='decoration-wrapper'>
                            <div className='circle'></div>
                            <div className='circle'></div>
                        </div>
                    </div>
                </section>
                <section className={`right-section ${(fade ? 'fade' : '')}`}>
                    <img src={`/images/background-auth/register/${currIdx+1}.jpg`} alt="register-bg" className='register-bg' />
                    <div className='bg-desc'>
                        <div className='bg-main-content'>
                            <h2><b>{bgIdentity.name[currIdx]}</b></h2>
                            <p><i>{bgIdentity.loc[currIdx]}</i></p>
                        </div>
                        <p className={`${(currIdx == 4 ? 'white' : 'bg-additional-content')}`}>{bgIdentity.desc[currIdx]}</p>
                    </div>
                </section>
            </section>
        </>
    );
};
