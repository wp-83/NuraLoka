import { useState } from "react";
import { Link } from "@inertiajs/react";
import { NAV_ITEMS } from "@js/Data/Navigation";

export default function Navbar() {
    const [active, setActive] = useState("Beranda");

    return (
        <>
            {/* ===================== DESKTOP ===================== */}

            <nav className="hidden md:block sticky top-0 z-50 bg-white shadow-md">
                <div className="container w-full">
                    <div className="flex py-1 items-center justify-between">

                        {/* Logo */}
                        <Link href="#">
                            <img
                                src="/images/logo/with-tagline.png"
                                alt="logo"
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
                                            onClick={() => setActive(item.label)}
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

                        {/* Right */}
                        <div className="flex items-center gap-2 w-max">
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
                                alt="picture"
                            />
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
                            alt="logo"
                            className="w-26 object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-2 w-max">
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
                            alt="picture"
                        />
                    </div>

                </div>

            </nav>

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
