import { usePage } from '@inertiajs/react';
import { HiOutlineBars3 } from 'react-icons/hi2';

export default function AdminHeader({ onOpenMobile }) {
    const{ user } = usePage().props.auth;

    return (
        <header className="sticky top-0 z-30 py-1 shrink-0 bg-white shadow-md px-4 sm:px-6 lg:px-8">
            <div className='container flex items-center justify-between'>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Buka sidebar"
                        onClick={onOpenMobile}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary-10 text-primary transition-colors hover:bg-primary-10 md:hidden"
                    >
                        <HiOutlineBars3 size={26} />
                    </button>

                    <div>
                        <h2 className="font-heading text-paragraph font-bold text-primary sm:text-subtitle">
                            Dasbor Admin
                        </h2>
                        <p className="hidden text-small text-gray-70 sm:block">
                            Selamat datang di Panel Admin
                        </p>
                    </div>
                </div>

                <div className="group flex items-center gap-2 rounded-xl p-1.5 transition-colors">
                    <div className="text-right">
                        <h5 className="font-body font-bold text-body text-secondary">
                            {user.fullname}
                        </h5>
                    </div>

                    <img
                        src={user.public_profile_photo}
                        className="w-12 h-12 rounded-full p-px border-2 border-error-dark object-cover"
                        alt="Profile"
                    />
                </div>
            </div>
        </header>
    );
}
