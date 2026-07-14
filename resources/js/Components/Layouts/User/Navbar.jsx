import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { NAV_ITEMS } from '@js/Data/UserNavigation';
import { PiUser } from 'react-icons/pi';
import { RiAdminLine } from 'react-icons/ri';
import { HiOutlineLogout } from 'react-icons/hi';

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function Navbar() {
    const { user } = usePage().props.auth;
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // ============================================================
    // RENDER HELPERS
    // ============================================================
    const renderProfileMenu = () => (
        <>
            {/* Profil Saya */}
            <div className="my-2">
                <Link
                    href={route('profile.index', user.username)}
                    className="
                        flex w-full items-center gap-3
                        rounded-xl px-3 py-2
                        font-body text-btn-sm text-primary
                        transition-colors
                        hover:bg-primary-10
                        hover:text-secondary
                    "
                >
                    <PiUser size={24} className="shrink-0" />
                    <span>Profil Saya</span>
                </Link>
            </div>

            {/* Panel Admin */}
            {user?.is_admin === 1 && (
                <div className="my-2">
                    <Link
                        href={route('admin.dashboard.index')}
                        className="
                            flex w-full items-center gap-3
                            rounded-xl px-3 py-2
                            font-body text-btn-sm text-primary
                            transition-colors
                            hover:bg-primary-10
                            hover:text-secondary
                        "
                    >
                        <RiAdminLine size={24} className="shrink-0" />
                        <span>Panel Admin</span>
                    </Link>
                </div>
            )}

            {/* Logout */}
            <div className="my-2">
                <Link
                    href={route('auth.logout')}
                    method="post"
                    as="button"
                    className="
                        flex w-full items-center gap-3
                        rounded-xl px-3 py-2
                        font-body text-btn-sm text-error-dark
                        transition-colors
                        hover:bg-error-light
                    "
                >
                    <HiOutlineLogout size={24} className="shrink-0" />
                    <span>Keluar</span>
                </Link>
            </div>
        </>
    );

    const renderNavItems = () => (
        <ul className="flex items-center gap-12">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = route().current(`${item.route}.*`);

                return (
                    <li key={item.label}>
                        <Link
                            href={route(`${item.route}.index`)}
                            className={`
                                group relative flex items-center gap-1.5 pb-1.5
                                transition-colors duration-200

                                ${
                                    isActive
                                        ? 'cursor-default text-accent'
                                        : 'text-primary hover:text-secondary'
                                }
                            `}
                        >
                            <Icon size={22} className="shrink-0" />

                            <span
                                className={`
                                    font-body text-btn-sm
                                    ${
                                        isActive
                                            ? 'font-bold'
                                            : 'font-normal'
                                    }
                                `}
                            >
                                {item.label}
                            </span>

                            <span
                                className={`
                                    absolute bottom-0 left-0
                                    h-0.5 rounded-full
                                    transition-all duration-300 ease-out

                                    ${
                                        isActive
                                            ? 'w-2/5 bg-accent'
                                            : 'w-0 bg-secondary group-hover:w-2/5'
                                    }
                                `}
                            />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <>
            {/* ========================================================
                DESKTOP OVERLAY
            ======================================================== */}
            <div
                onClick={() => setIsProfileOpen(false)}
                className={`
                    fixed inset-0 z-40
                    hidden bg-black/30
                    transition-opacity duration-300 ease-out
                    md:block

                    ${
                        isProfileOpen
                            ? 'visible pointer-events-auto opacity-100'
                            : 'invisible pointer-events-none opacity-0'
                    }
                `}
            />

            {/* ========================================================
                DESKTOP NAVBAR
            ======================================================== */}
            <nav className="sticky top-0 z-50 hidden bg-white shadow-md md:block">
                <div className="container w-full">
                    <div className="flex items-center justify-between py-1">
                        {/* Logo */}
                        <Link href={route('home.index')}>
                            <img
                                src="/images/logo/with-tagline.png"
                                alt="Logo NuraLoka"
                                className="w-26 object-contain"
                            />
                        </Link>

                        {/* Navigation */}
                        {renderNavItems()}

                        {/* Profile */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsProfileOpen((prev) => !prev)
                                }
                                className="
                                    group flex items-center gap-2
                                    rounded-xl p-1.5
                                    transition-colors
                                    hover:cursor-pointer
                                "
                            >
                                <div className="text-right">
                                    <h5 className="font-body text-small font-bold text-primary">
                                        {user.fullname}
                                    </h5>

                                    <p className="font-body text-micro italic text-secondary">
                                        Gelar/Badge
                                    </p>
                                </div>

                                <img
                                    src={user.public_profile_photo}
                                    alt="Profile"
                                    className="
                                        h-12 w-12 rounded-full
                                        border-2 border-secondary-70
                                        object-cover p-px
                                    "
                                />
                            </button>

                            {/* Desktop Profile Popup */}
                            <div
                                className={`
                                    absolute right-0 top-full z-50
                                    mt-4 w-54
                                    rounded-2xl bg-white
                                    px-4 py-2
                                    shadow-xl
                                    transition-all duration-200

                                    ${
                                        isProfileOpen
                                            ? 'visible translate-y-0 opacity-100'
                                            : 'invisible -translate-y-2 opacity-0'
                                    }
                                `}
                            >
                                {renderProfileMenu()}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ========================================================
                MOBILE HEADER
            ======================================================== */}
            <nav className="sticky top-0 z-50 bg-white shadow-md md:hidden">
                <div className="container flex w-full items-center justify-between py-1">
                    {/* Logo */}
                    <Link href={route('home.index')}>
                        <img
                            src="/images/logo/with-tagline.png"
                            alt="Logo NuraLoka"
                            className="w-26 object-contain"
                        />
                    </Link>

                    {/* Mobile Profile Button */}
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(true)}
                        className="flex w-max items-center gap-2"
                    >
                        <div className="text-right">
                            <h5 className="font-body text-small font-bold text-primary">
                                {user.fullname}
                            </h5>

                            <p className="font-body text-micro italic text-secondary">
                                Gelar/Badge Mobile
                            </p>
                        </div>

                        <img
                            src={user.public_profile_photo}
                            alt="Profile"
                            className="
                                h-12 w-12 rounded-full
                                border-2 border-secondary-70
                                object-cover p-px
                            "
                        />
                    </button>
                </div>
            </nav>

            {/* ========================================================
                MOBILE PROFILE POPUP
            ======================================================== */}
            <div
                className={`
                    fixed inset-0 z-[9999]
                    md:hidden

                    ${
                        isProfileOpen
                            ? 'visible pointer-events-auto'
                            : 'invisible pointer-events-none'
                    }
                `}
            >
                {/* Overlay */}
                <div
                    onClick={() => setIsProfileOpen(false)}
                    className={`
                        absolute inset-0 z-0
                        bg-black/30
                        transition-opacity duration-300 ease-out

                        ${
                            isProfileOpen
                                ? 'opacity-100'
                                : 'opacity-0'
                        }
                    `}
                />

                {/* Bottom Sheet */}
                <div
                    className={`
                        absolute bottom-0 left-0 right-0 z-10
                        rounded-t-3xl bg-white
                        px-4 pb-6 pt-2
                        shadow-2xl
                        transition-all duration-500
                        ease-[cubic-bezier(0.22,1,0.36,1)]

                        ${
                            isProfileOpen
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-full opacity-0'
                        }
                    `}
                >
                    {/* Indicator */}
                    <div className="mx-auto my-3 h-1 w-12 rounded-full bg-primary-70" />

                    {/* Profile Menu */}
                    {renderProfileMenu()}
                </div>
            </div>

            {/* ========================================================
                MOBILE BOTTOM NAVIGATION
            ======================================================== */}
            <nav
                className="
                    fixed bottom-0 left-0 right-0 z-50
                    bg-white
                    shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)]
                    md:hidden
                "
            >
                <div className="grid h-16 grid-cols-5">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = route().current(
                            `${item.route}.*`
                        );

                        return (
                            <Link
                                key={item.label}
                                href={route(`${item.route}.index`)}
                                className="
                                    group relative
                                    flex flex-col
                                    items-center justify-center
                                    gap-1
                                "
                            >
                                <Icon
                                    size={22}
                                    className={
                                        isActive
                                            ? 'text-accent'
                                            : 'text-primary group-hover:text-secondary'
                                    }
                                />

                                <span
                                    className={`
                                        font-body text-small

                                        ${
                                            isActive
                                                ? 'font-bold text-accent'
                                                : 'text-primary group-hover:text-secondary'
                                        }
                                    `}
                                >
                                    {item.label}
                                </span>

                                {isActive && (
                                    <span
                                        className="
                                            absolute top-0
                                            h-1 w-10
                                            rounded-b-full
                                            bg-accent
                                        "
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
