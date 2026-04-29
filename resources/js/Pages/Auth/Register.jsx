import '../../../js/Pages/Auth/Register.css';

export default function Register() {
    return (
        <section className="auth-container">
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

                    <form className="register-form">
                        <div className="input-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <i className="icon-user"></i>
                                <input type="text" placeholder="cth: kocakbanget123" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <i className="icon-email"></i>
                                <input type="email" placeholder="email.kamu@gmail.com" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Kata Sandi</label>
                            <div className="input-wrapper">
                                <i className="icon-lock"></i>
                                <input type="password" placeholder="Kata sandi kamu" />
                                <i className="icon-eye"></i>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Konfirmasi Kata Sandi</label>
                            <div className="input-wrapper">
                                <i className="icon-lock"></i>
                                <input type="password" placeholder="Konfirmasi kata sandi kamu" />
                                <i className="icon-eye"></i>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">Daftar Akun</button>
                        <button type="button" className="btn-google">
                            <img src="/images/icons/google.png" alt="" /> Daftar dengan Google
                        </button>
                    </form>

                    <p className="login-redirect">
                        Sudah Punya Akun? <a href="/login">Masuk Sekarang!</a>
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
        </section>
    );
}