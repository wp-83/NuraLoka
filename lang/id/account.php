<?php

// Halaman autentikasi/akun: Login, Register, DetailAccount, ForgetPassword,
// ForgetPasswordSuccess, ResetPassword, Banned.
return [
    // ── Login ──
    'login' => [
        'meta_title' => 'Masuk Akun',
        'meta_description' => 'Temukan rekomendasi tempat wisata, kuliner, dan lokasi persinggahan terbaik di sepanjang rute perjalanan antar kota di Indonesia bersama NuraLoka.',
        'welcome_greeting' => 'Hi, Nuravers!',
        'welcome_back' => 'Selamat datang kembali di',
        'title' => 'Masuk Akun',
        'subtitle' => 'Ayo masuk ke akun Anda untuk eksplorasi Indonesia bersama :app!',
        'identity_label' => 'Email atau Username',
        'identity_placeholder' => 'email.kamu@gmail.com',
        'password_label' => 'Kata Sandi',
        'password_placeholder' => 'Kata sandi kamu',
        'forgot_password' => 'Lupa kata sandi?',
        'remember_me' => 'Ingat Saya untuk 30 Hari Ke Depan',
        'submit' => 'Masuk',
        'submit_processing' => 'Memeriksa data...',
        'google' => 'Masuk dengan Google',
        'no_account' => 'Belum punya akun?',
        'register_now' => 'Daftar Sekarang!',
    ],

    // Slide latar login (nama & lokasi tempat tetap sebagai nama asli)
    'login_slides' => [
        ['name' => 'Candi Borobudur', 'loc' => 'Magelang, Jawa Tengah', 'desc' => 'Candi Buddha terbesar di dunia dengan stupa khas dan situs warisan UNESCO.'],
        ['name' => 'Gunung Kerinci', 'loc' => 'Kerinci, Jambi', 'desc' => 'Gunung tertinggi di Sumatra dengan lanskap megah dan sering diselimuti kabut.'],
        ['name' => 'Papeda', 'loc' => 'Jayapura, Papua', 'desc' => 'Makanan khas berbahan sagu bertekstur kental, biasanya disajikan dengan kuah ikan.'],
        ['name' => 'Proses Tenun Tradisional', 'loc' => 'Sikka, Nusa Tenggara Timur', 'desc' => 'Proses menenun kain dengan alat tradisional menggunakan benang berwarna, menghasilkan motif khas daerah.'],
        ['name' => 'Kilometer 0 Indonesia', 'loc' => 'Sabang, Aceh', 'desc' => 'Monumen penanda titik nol kilometer Indonesia sebagai batas paling barat NKRI.'],
    ],

    // ── Register ──
    'register' => [
        'layout_title' => 'Daftar Akun',
        'title' => 'Daftar Akun',
        'subtitle' => 'Segera jadi bagian dari :app dan mulai eksplorasi Indonesia!',
        'username_label' => 'Username',
        'username_placeholder' => 'kocakbanget123',
        'email_label' => 'Email',
        'email_placeholder' => 'email.kamu@gmail.com',
        'password_label' => 'Kata Sandi',
        'password_placeholder' => 'Kata sandi kamu',
        'confirm_label' => 'Konfirmasi Kata Sandi',
        'confirm_placeholder' => 'Konfirmasi kata sandi kamu',
        'submit' => 'Daftar Akun',
        'submit_processing' => 'Mendaftarkan akun...',
        'google' => 'Daftar dengan Google',
        'have_account' => 'Sudah punya akun?',
        'login_now' => 'Masuk Sekarang!',
    ],

    // ── Detail akun (lengkapi data) ──
    'detail' => [
        'layout_title' => 'Informasi Akun',
        'title' => 'Informasi Akun',
        'subtitle' => 'Satu langkah lagi untuk menjadi bagian dari :app!',
        'fullname_label' => 'Nama Lengkap',
        'fullname_placeholder' => 'Nura Panjang Banget',
        'dob_label' => 'Tanggal Lahir',
        'gender_label' => 'Jenis Kelamin',
        'gender_placeholder' => 'Jenis kelamin kamu',
        'province_label' => 'Provinsi Domisili',
        'province_placeholder' => 'Provinsi tempat kamu tinggal sekarang',
        'data_approval' => 'Saya telah membaca dan menyetujui penggunaan data pribadi saya untuk proses registrasi dan konfirmasi akun.',
        'submit' => 'Simpan Data dan Masuk',
        'submit_processing' => 'Memeriksa data...',
    ],

    // ── Lupa kata sandi ──
    'forgot' => [
        'meta_title' => 'Ganti Kata Sandi',
        'title' => 'Ganti Kata Sandi',
        'desc' => 'Masukkan email yang terdaftar pada akun kamu. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi ke email kamu.',
        'email_placeholder' => 'Masukkan alamat email akun kamu...',
        'submit' => 'Kirim Tautan Ganti Kata Sandi',
        'submit_processing' => 'Mengirim...',
        'remember_password' => 'Sudah ingat kata sandi?',
        'login_now' => 'Masuk Sekarang!',
    ],

    // ── Lupa kata sandi (sukses kirim) ──
    'forgot_success' => [
        'title' => 'Email verifikasi berhasil dikirim!',
        'desc' => 'Silakan cek email kamu untuk melakukan verifikasi email sebelum mengganti kata sandi.',
        'back_to_login' => 'Kembali ke halaman masuk akun',
    ],

    // ── Reset kata sandi ──
    'reset' => [
        'meta_title' => 'Ganti Kata Sandi',
        'title' => 'Ganti Kata Sandi',
        'for_account' => 'untuk akun :name',
        'password_label' => 'Kata Sandi Baru',
        'password_placeholder' => 'Masukkan kata sandi baru',
        'confirm_label' => 'Konfirmasi Kata Sandi Baru',
        'confirm_placeholder' => 'Masukkan kembali kata sandi baru',
        'submit' => 'Simpan Kata Sandi',
        'submit_processing' => 'Menyimpan...',
    ],

    // ── Akun diblokir ──
    'banned' => [
        'title' => 'Akun Anda Telah Diblokir',
        'desc' => 'Maaf, akun Anda telah diblokir dan saat ini tidak dapat mengakses layanan NuraLoka. Silakan hubungi administrator jika Anda merasa ini adalah sebuah kesalahan.',
        'back_home' => 'Kembali ke Beranda',
    ],

    // Jenis kelamin (dipakai form akun)
    'gender_male' => 'Laki-laki',
    'gender_female' => 'Perempuan',
    'gender_unspecified' => 'Tidak ingin memberi tahu',
];
