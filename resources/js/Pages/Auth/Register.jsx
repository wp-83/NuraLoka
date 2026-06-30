import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';
import SignUp from '@js/Layouts/SignUp';
import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
export default function Register(){
    const [showPass, setShowPass] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('auth.register.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <div className='page-context'>
                <h2><b>Daftar Akun</b></h2>
                <p>Segera jadi bagian langsung dari <span className='nuraloka-text'><span>Nura</span><span>Loka</span></span>!</p>
            </div>
            <form method='POST' className='register-form' onSubmit={handleSubmit}>
                <div className='input-group'>
                    <label htmlFor="username">Username</label>
                    <div className='input-wrapper'>
                        <div className='illustration-icon'>
                            <FaRegUserCircle className='icon' />
                        </div>
                        <input type="text" placeholder='kocakbanget123' id='username' name='username' autoComplete='off' onChange={(e) => setData('username', e.target.value)} value={data.username} />
                    </div>
                    {
                        (errors.username) && (<p className='error-message'>{errors.username}</p>)
                    }
                </div>
                <div className='input-group'>
                    <label htmlFor="email">Email</label>
                    <div className='input-wrapper'>
                        <div className='illustration-icon'>
                            <MdOutlineMail className='icon' />
                        </div>
                        <input type="text" placeholder='email.kamu@gmail.com' id='email' name='email' autoComplete='off' onChange={(e) => setData('email', e.target.value)} value={data.email} />
                    </div>
                    {
                        (errors.email) && (<p className='error-message'>{errors.email}</p>)
                    }
                </div>
                <div className='input-group'>
                    <label htmlFor="password">Kata Sandi</label>
                    <div className='input-wrapper'>
                        <div className='illustration-icon'>
                            <GiPadlock className='icon' />
                        </div>
                        <input type={(showPass) ? 'text' : 'password'} placeholder='Kata sandi kamu' id='password' name='password' onChange={(e) => setData('password', e.target.value)} value={data.password} />
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
                    {
                        (errors.password) && (<p className='error-message'>{errors.password}</p>)
                    }
                </div>
                <div className='input-group'>
                    <label htmlFor="passwordConfirm">Konfirmasi Kata Sandi</label>
                    <div className='input-wrapper'>
                        <div className='illustration-icon'>
                            <GiPadlock className='icon' />
                        </div>
                        <input type={(showPassConfirm) ? 'text' : 'password'} placeholder='Konfirmasi kata sandi kamu' id='passwordConfirm' name='passwordConfirm' onChange={(e) => setData('confirmPassword', e.target.value)} value={data.confirmPassword} />
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
                    {
                        (errors.confirmPassword) && (<p className='error-message'>{errors.confirmPassword}</p>)
                    }
                </div>
                <div className='register-btn-container'>
                    <button type='submit' className='btn-primary'>Daftar Akun</button>
                    <a href={route('auth.google.register')}>
                        <button type='button' className='btn-white google-register-btn'>
                            <img src="/images/icons/google.png" alt="google-icon" />
                            <p>Daftar dengan Google</p>
                        </button>
                    </a>
                </div>
            </form>
            <p className='footer-content'>Sudah punya akun? <Link href={route('auth.login.index')}>Masuk Sekarang!</Link></p>
        </>
    );
}

Register.layout = page => <SignUp title="Daftar Akun" content={page}></SignUp>
