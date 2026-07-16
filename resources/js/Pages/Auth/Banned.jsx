import Button from '@components/Forms/Button';

import { router } from '@inertiajs/react';
import { MdBlock } from 'react-icons/md';

export default function Banned() {
    const handleLogout = () => {
        router.post(route('auth.logout'));
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-10 px-6">
            <div className="flex max-w-lg flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-error-light">
                    <MdBlock className="text-5xl text-error-dark" />
                </div>

                <h1 className="mb-3 text-title font-bold text-gray-100">
                    Akun Anda Telah Diblokir
                </h1>

                <p className="mb-8 text-body leading-relaxed text-gray-60">
                    Maaf, akun Anda telah diblokir dan saat ini tidak dapat
                    mengakses layanan NuraLoka. Silakan hubungi administrator
                    jika Anda merasa ini adalah sebuah kesalahan.
                </p>

                <Button onClick={handleLogout}>
                    Kembali ke Beranda
                </Button>
            </div>
        </main>
    );
}
