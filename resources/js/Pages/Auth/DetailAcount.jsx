import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';
import SignUp from '@js/Layouts/SignUp';
import { Link, useForm, usePage } from '@inertiajs/react';
import '@css/Auth/DetailAccount.css';
import { useState } from 'react';

export default function DetailAccount(){
    const { provinces } = usePage().props;
    const [disabledBtn, setDisabledBtn] = useState(true);

    const { data, setData, post, reset, processing, errors } = useForm({
        'fullname': '',
        'dob': '',
        'gender': '',
        'province': '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.register.store.detail'));
    };

    return (
        <>
            <div className='page-context'>
                <h2><b>Informasi Akun</b></h2>
                <p>Satu langkah lagi untuk menjadi bagian dari <span className='nuraloka-text'><span>Nura</span><span>Loka</span></span>!</p>
            </div>
            <form className='register-form' method='POST' onSubmit={handleSubmit}>
                <div className='input-group'>
                    <label htmlFor="fullname">Nama Lengkap</label>
                    <div className='input-wrapper'>
                        <input type="text" placeholder='Nura Panjang Banget' id='fullname' name='fullname' autoComplete='off' onChange={(e) => setData('fullname', e.target.value)} value={data.fullname} />
                    </div>
                </div>
                <div className='detail-account-split'>
                    <div className='input-group split-element'>
                        <label htmlFor="dob">Tanggal Lahir</label>
                        <div className='input-wrapper'>
                            <input type="date" id='dob' name='dob' autoComplete='off' required onChange={(e) => setData('dob', e.target.value)} value={data.dob} />
                        </div>
                    </div>
                    <div className='select-group split-element'>
                        <label htmlFor="gender">Jenis Kelamin</label>
                        <div className='select-wrapper'>
                            <select name="gender" id="gender" value={data.gender} required onChange={(e) => setData('gender', e.target.value)} value={data.gender}>
                                <option value="" disabled hidden>Jenis kelamin kamu</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                                <option value="unspecified">Tidak ingin memberi tahu</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className='select-group'>
                    <label htmlFor="province">Provinsi Domisili</label>
                    <div className='select-wrapper'>
                        <select name="province" id="province" value={data.province} required onChange={(e) => setData('province', e.target.value)} value={data.province}>
                            <option value="" disabled hidden>Provinsi tempat kamu tinggal sekarang</option>
                            {
                                provinces.map(province => (
                                    <option value={province.id} key={province.id}>{province.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <label htmlFor="dataApproval" className='checkbox'>
                    <span className='box'></span>
                    <input type="checkbox" name="dataApproval" id="dataApproval" onChange={(e) => setDisabledBtn(!e.target.checked)} />
                    <p className='content-label'>Saya telah membaca dan menyetujui penggunaan data pribadi saya untuk proses registrasi dan konfirmasi akun.</p>
                </label>
                <div className='register-btn-container'>
                    <button className={(disabledBtn || processing) ? 'btn-inactive' : 'btn-primary'} type='submit' disabled={disabledBtn}>
                        {
                            (processing) ? (
                                <>
                                    <div className='loading-bar'></div>
                                    <p>Memeriksa data...</p>
                                </>
                            ) : 'Simpan Data dan Masuk'
                        }
                    </button>
                </div>
            </form>
        </>
    );
}

DetailAccount.layout = page => <SignUp title="Informasi Akun" content={page}></SignUp>
