import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';
import SignUp from '@js/Layouts/SignUp';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Register(){
    const [showPass, setShowPass] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);

    return (
        <>
            <div className='page-context'>
                <h2><b>Informasi Akun</b></h2>
                <p>Satu langkah lagi untuk menjadi bagian dari <span className='nuraloka-text'><span>Nura</span><span>Loka</span></span>!</p>
            </div>
            <form className='register-form'>
                <div className='input-group'>
                    <label htmlFor="username">Nama Lengkap</label>
                    <div className='input-wrapper'>
                        <div className='illustration-icon'>
                            <FaRegUserCircle className='icon' />
                        </div>
                        <input type="text" placeholder='kocakbanget123' id='username' name='username' autoComplete='off' />
                    </div>
                </div>

                <div className='register-btn-container'>
                    <button className='btn-primary'>Daftar Akun</button>
                </div>
            </form>
        </>
    );
}

Register.layout = page => <SignUp title="Informasi Akun" content={page}></SignUp>
