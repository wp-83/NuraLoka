import { Head, Link, useForm } from '@inertiajs/react';
import '../../../js/Pages/Auth/Register.css';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <section className="auth-container">
            <Head title="Daftar Akun" />
            
            {/* Left Side: Form Section */}
            <section className="auth-form-section">
                {/* Top Left Circle Decoration */}
                <div className='circle-decoration-container top-left'>
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                </div>

                <div className="form-content">
                    <div className="logo-wrapper">
                        <p className="greeting">Hi, Nuravers! Selamat datang di</p>
                        <img src="/images/logo/with-tagline.png" alt="logo" className="logo-img" />
                    </div>

                    <h1 className="form-title">Daftar Akun</h1>
                    <p className="form-subtitle">Segera jadi bagian langsung dari <span className="brand-highlight">NuraLoka!</span></p>

                    <form className="register-form" onSubmit={submit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-wrapper">
                                <i className="icon-user"></i>
                                <input 
                                    id="username"
                                    type="text" 
                                    name="username"
                                    value={data.username}
                                    placeholder="cth: kocakbanget123" 
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.username && <span className="error-message">{errors.username}</span>}
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-wrapper">
                                <i className="icon-email"></i>
                                <input 
                                    id="email"
                                    type="email" 
                                    name="email"
                                    value={data.email}
                                    placeholder="email.kamu@gmail.com" 
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Kata Sandi</label>
                            <div className="input-wrapper">
                                <i className="icon-lock"></i>
                                <input 
                                    id="password"
                                    type="password" 
                                    name="password"
                                    value={data.password}
                                    placeholder="Kata sandi kamu" 
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <i className="icon-eye"></i>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <label htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
                            <div className="input-wrapper">
                                <i className="icon-lock"></i>
                                <input 
                                    id="password_confirmation"
                                    type="password" 
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    placeholder="Konfirmasi kata sandi kamu" 
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <i className="icon-eye"></i>
                            </div>
                            {errors.password_confirmation && <span className="error-message">{errors.password_confirmation}</span>}
                        </div>

                        <button type="submit" className="btn-submit" disabled={processing}>
                            {processing ? 'Mendaftarkan...' : 'Daftar Akun'}
                        </button>
                        
                        <button type="button" className="btn-google">
                            {/* <img src="/images/icons/google.png" alt="" /> */} Daftar dengan Google
                        </button>
                    </form>

                    <p className="login-redirect">
                        Sudah Punya Akun? <Link href="/login">Masuk Sekarang!</Link>
                    </p>
                </div>

                {/* Bottom Right Circle Decoration */}
                <div className='circle-decoration-container bottom-right'>
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                </div>
            </section>

            {/* Right Side: Image & Tourism Info */}
            <section className="auth-image-section">
                <img src="/images/background-auth/1.jpg" alt="Tugu Khatulistiwa" className="bg-image" />
                <div className="image-overlay-text">
                    <h2>Tugu Khatulistiwa</h2>
                    <p className="location">Pontianak, Kalimantan Barat</p>
                    <p className="description">
                        Monumen penanda garis khatulistiwa (0° lintang) yang menjadi ikon kota dan objek wisata edukasi.
                    </p>
                </div>
            </section>

            <style>{`
                .error-message {
                    color: #ff4d4f;
                    font-size: 0.8rem;
                    margin-top: 4px;
                    display: block;
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </section>
    );
}