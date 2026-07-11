import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { NAV_ITEMS } from "@js/Data/Navigation";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { PiUser } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { HiOutlineLogout } from "react-icons/hi";

export default function Navbar() {
    const { user } = usePage().props;
    const [active, setActive] = useState("Beranda");
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            {/* ===================== DESKTOP OVERLAY ===================== */}

            <div
                onClick={() => setIsProfileOpen(false)}
                className={`
                    hidden md:block
                    fixed inset-0 z-40
                    bg-black/30
                    transition-opacity duration-300 ease-out
                    ${
                        isProfileOpen
                            ? "visible opacity-100 pointer-events-auto"
                            : "invisible opacity-0 pointer-events-none"
                    }
                `}
            />

            {/* ===================== DESKTOP ===================== */}

            <nav className="hidden md:block sticky top-0 z-50 bg-white shadow-md">
                <div className="container w-full">
                    <div className="flex py-1 items-center justify-between">

                        {/* Logo */}
                        <Link href="#">
                            <img
                                src="/images/logo/with-tagline.png"
                                alt="Logo NuraLoka"
                                className="w-26 object-contain"
                            />
                        </Link>

                        {/* Menu */}
                        <ul className="flex items-center gap-12">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = active === item.label;

                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={() =>
                                                setActive(item.label)
                                            }
                                            className={`
                                                group relative flex items-center gap-1.5
                                                pb-1.5
                                                transition-colors duration-200
                                                ${
                                                    isActive
                                                        ? "text-accent cursor-default"
                                                        : "text-primary hover:text-secondary"
                                                }
                                            `}
                                        >
                                            <Icon
                                                size={22}
                                                className="shrink-0"
                                            />

                                            <span
                                                className={`
                                                    font-body text-btn-sm
                                                    ${
                                                        isActive
                                                            ? "font-bold"
                                                            : "font-normal"
                                                    }
                                                `}
                                            >
                                                {item.label}
                                            </span>

                                            {/* Underline */}
                                            <span
                                                className={`
                                                    absolute bottom-0 left-0
                                                    h-0.5 rounded-full
                                                    transition-all duration-300 ease-out
                                                    ${
                                                        isActive
                                                            ? "w-2/5 bg-accent"
                                                            : "w-0 bg-secondary group-hover:w-2/5"
                                                    }
                                                `}
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Profile */}
                        <div
                            ref={profileRef}
                            className="relative"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setIsProfileOpen((prev) => !prev)
                                }
                                className="group flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:cursor-pointer"
                            >
                                <div className="text-right">
                                    <h5 className="font-body font-bold text-small text-primary">
                                        Jayadi Christopher
                                    </h5>

                                    <p className="font-body text-micro italic text-secondary">
                                        Pemula
                                    </p>
                                </div>

                                <img
                                    src="/images/background-auth/login/1.jpg"
                                    className="w-12 h-12 rounded-full p-px border-2 border-secondary-70 object-cover"
                                    alt="Profile"
                                />
                            </button>

                            {/* Profile Popup */}
                            <div
                                className={`
                                    absolute right-0 top-full mt-4
                                    w-54
                                    rounded-2xl
                                    bg-white
                                    px-4
                                    py-2
                                    shadow-xl
                                    transition-all duration-200
                                    ${
                                        isProfileOpen
                                            ? "visible translate-y-0 opacity-100"
                                            : "invisible -translate-y-2 opacity-0"
                                    }
                                `}
                            >
                                {/* Menu */}
                                <div className="my-2">
                                    <Link
                                        href="/profile"
                                        onClick={() =>
                                            setIsProfileOpen(false)
                                        }
                                        className="
                                            flex items-center gap-3
                                            rounded-xl w-full px-3 py-2
                                            font-body text-btn-sm text-primary
                                            transition-colors
                                            hover:bg-primary-10 hover:text-secondary
                                        "
                                    >
                                        <PiUser size={24} />
                                        Profil Saya
                                    </Link>
                                </div>

                                {user?.is_admin == 1 && (
                                    <div className="my-2">
                                        <Link
                                            href="/profile"
                                            onClick={() =>
                                                setIsProfileOpen(false)
                                            }
                                            className="
                                                flex items-center gap-3
                                                rounded-xl w-full px-3 py-2
                                                font-body text-btn-sm text-primary
                                                transition-colors
                                                hover:bg-primary-10 hover:text-secondary
                                            "
                                        >
                                            <RiAdminLine size={24} />
                                            Panel Admin
                                        </Link>
                                    </div>
                                )}

                                <div className="my-2">
                                    <Link
                                        href={route("auth.logout")}
                                        method="post"
                                        as="button"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="
                                            flex items-center gap-3
                                            rounded-xl w-full px-3 py-2
                                            font-body text-btn-sm text-error-dark
                                            transition-colors
                                            hover:bg-error-light
                                        "
                                    >
                                        <HiOutlineLogout size={24} />
                                        Keluar
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>

            {/* ===================== MOBILE HEADER ===================== */}

            <nav className="md:hidden sticky top-0 z-50 bg-white shadow-md">
                <div className="flex py-1 items-center justify-between container w-full">
                    {/* Logo */}
                    <Link href="#">
                        <img
                            src="/images/logo/with-tagline.png"
                            alt="Logo NuraLoka"
                            className="w-26 object-contain"
                        />
                    </Link>

                    {/* Mobile Profile */}
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-2 w-max"
                    >
                        <div className="text-right">
                            <h5 className="font-body font-bold text-small text-primary">
                                Jayadi Christopher
                            </h5>

                            <p className="font-body text-micro italic text-secondary">
                                Pemula
                            </p>
                        </div>

                        <img
                            src="/images/background-auth/login/1.jpg"
                            className="w-12 h-12 rounded-full p-px border-2 border-secondary-70 object-cover"
                            alt="Profile"
                        />
                    </button>
                </div>
            </nav>

            {/* ===================== MOBILE PROFILE POPUP ===================== */}

            <div
                className={`
                    md:hidden fixed inset-0 z-[60]
                    transition-all duration-300 ease-out
                    ${
                        isProfileOpen
                            ? "visible pointer-events-auto"
                            : "invisible pointer-events-none"
                    }
                `}
            >
                {/* Dark Overlay */}
                <button
                    type="button"
                    aria-label="Tutup menu profil"
                    onClick={() => setIsProfileOpen(false)}
                    className={`
                        absolute inset-0
                        bg-black/30
                        transition-opacity duration-300 ease-out
                        ${isProfileOpen ? "opacity-100" : "opacity-0"}
                    `}
                />

                {/* Bottom Sheet */}
                <div
                    className={`
                        absolute bottom-0 left-0 right-0
                        rounded-t-3xl
                        bg-white
                        px-4 py-2
                        shadow-2xl
                        transition-all duration-500
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        ${
                            isProfileOpen
                                ? "translate-y-0 opacity-100"
                                : "translate-y-full opacity-0"
                        }
                    `}
                >
                    {/* Indicator */}
                    <div className="mx-auto my-3 h-1 w-12 rounded-full bg-gray-30" />

                    {/* Menu */}
                    <div className="my-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="
                                flex items-center gap-3
                                rounded-xl w-full px-3 py-2
                                font-body text-btn-sm text-primary
                                transition-colors
                                hover:bg-primary-10 hover:text-secondary
                            "
                        >
                            <PiUser size={24} />
                            Profil Saya
                        </Link>
                    </div>

        {/* Admin Menu */}
        {user?.is_admin == 1 && (
            <div className="my-2">
                <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="
                        flex items-center gap-3
                        rounded-xl w-full px-3 py-2
                        font-body text-btn-sm text-primary
                        transition-colors
                        hover:bg-primary-10 hover:text-secondary
                    "
                >
                    <RiAdminLine size={24} />
                    Panel Admin
                </Link>
            </div>
        )}

        {/* Logout */}
        <div className="my-2">
            <Link
                href={route("auth.logout")}
                method="post"
                as="button"
                onClick={() => setIsProfileOpen(false)}
                className="
                    flex items-center gap-3
                    rounded-xl w-full px-3 py-2
                    font-body text-btn-sm text-error-dark
                    transition-colors
                    hover:bg-error-light
                "
            >
                <HiOutlineLogout size={24} />
                Keluar
            </Link>
        </div>
    </div>
</div>

            {/* ===================== MOBILE BOTTOM NAV ===================== */}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)] z-50">
                <div className="grid grid-cols-5 h-16">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = active === item.label;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setActive(item.label)}
                                className="relative flex flex-col items-center group justify-center gap-1"
                            >
                                <Icon
                                    size={22}
                                    className={
                                        isActive
                                            ? "text-accent"
                                            : "text-primary group-hover:text-secondary"
                                    }
                                />

                                <span
                                    className={`font-body text-small ${
                                        isActive
                                            ? "text-accent font-bold"
                                            : "text-primary group-hover:text-secondary"
                                    }`}
                                >
                                    {item.label}
                                </span>

                                {isActive && (
                                    <span className="absolute top-0 h-1 w-10 rounded-b-full bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
