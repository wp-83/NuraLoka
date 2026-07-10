import Button from '@components/Forms/Button';
import { Link, Head } from '@inertiajs/react';
import { IoChevronBackCircleOutline } from 'react-icons/io5';

export default function ForgetPasswordSuccess() {
    return (
        <>
            <Head title="NuraLoka | Ganti Kata Sandi" />

            <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gray-10 px-6">

                <section className="flex w-full flex-col items-center">

                    <img
                        src="/images/logo/with-tagline.png"
                        alt="Logo"
                        className="mb-5 mt-4 w-48"
                    />

                    <h1 className="mb-1 text-title font-heading font-bold text-center text-primary-100">
                        Email verifikasi berhasil dikirim!
                    </h1>

                    <p className="mb-8 max-w-2xl text-center text-paragraph">
                        Silakan cek email kamu untuk melakukan verifikasi email sebelum mengganti kata sandi.
                    </p>

                    <Link href={route('auth.login.index')}>
                        <Button iconLeft={<IoChevronBackCircleOutline size={28} />}>Kembali ke halaman masuk akun</Button>
                    </Link>
                </section>
            </main>
        </>
    );
}

