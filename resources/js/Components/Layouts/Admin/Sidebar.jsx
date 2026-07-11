import { Link, usePage } from '@inertiajs/react';
import {
    HiOutlineXMark,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from 'react-icons/hi2';
import { adminMenuItems } from '@js/Data/AdminNavigation';
import { HiOutlineLogout } from 'react-icons/hi';
import { FaRegUser } from 'react-icons/fa';

export default function AdminSidebar({ isCollapsed, isMobileOpen, onToggleCollapsed, onCloseMobile }) {
    const { url } = usePage();

    return (
        <>
            {isMobileOpen && (
                <button
                    type="button"
                    aria-label="Tutup sidebar"
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen flex-col
                    bg-white
                    shadow-[4px_0_20px_rgba(0,0,0,0.05)]
                    transition-all duration-300 ease-in-out

                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}

                    md:translate-x-0

                    ${isCollapsed ? 'w-72 md:w-20' : 'w-72 md:w-64 lg:w-72'}
                `}
            >
                <div
                    className={`
                        flex shrink-0
                        transition-all duration-300
                        pt-4
                        pb-4
                        items-center
                        justify-between
                        px-4
                        ${isCollapsed ? 'md:flex-col md:justify-center md:px-2' : 'md:flex-row md:items-center md:justify-between md:px-4'}
                    `}
                >
                    <div
                        className={`
                            flex min-w-0 items-center gap-3
                            ${isCollapsed ? 'md:w-full md:justify-center md:gap-0' : ''}
                        `}
                    >

                        <div
                            className={`
                                min-w-0 w-32 whitespace-nowrap transition-all duration-300
                                ${isCollapsed ? 'md:w-0 md:overflow-hidden md:opacity-0' : ''}
                            `}
                        >
                            <img src="/images/logo/with-tagline.png" alt="logo" />
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                        onClick={onToggleCollapsed}
                        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-primary text-secondary transition-colors hover:bg-primary-10 md:flex"
                    >
                        {isCollapsed ? <HiOutlineChevronRight size={24} /> : <HiOutlineChevronLeft size={24} />}
                    </button>

                    <button
                        type="button"
                        aria-label="Tutup sidebar"
                        onClick={onCloseMobile}
                        className="flex h-10 w-10 shrink-0 p-2 items-center justify-center rounded-xl text-primary-100 transition-colors hover:bg-primary-10 md:hidden"
                    >
                        <HiOutlineXMark size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-hidden w-full px-4 py-2">
                    <div className="flex flex-col gap-2">
                        {adminMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === '/admin' ? url === item.href : url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={onCloseMobile}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`
                                        group flex h-12 items-center rounded-xl transition-all duration-200
                                        ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-4 px-4'}
                                        ${isActive ? 'bg-accent-10 text-accent font-bold' : 'text-primary-100 hover:bg-primary-10 hover:text-secondary'}
                                    `}
                                >
                                    <Icon size={24} className="shrink-0" />
                                    <span
                                        className={`
                                            whitespace-nowrap text-btn-sm font-body transition-all duration-300
                                            ${isCollapsed ? 'md:w-0 md:overflow-hidden md:opacity-0' : 'opacity-100'}
                                        `}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="shrink-0 border-t-2 border-gray-30 px-4 py-2 flex flex-col gap-2">
                    <Link
                        href="#"
                        className={`
                            flex h-12 w-full items-center rounded-xl text-primary transition-colors hover:bg-primary-10
                            ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4'}
                        `}
                    >
                        <FaRegUser size={24} className="shrink-0" />
                        <span
                            className={`
                                whitespace-nowrap text-btn-sm font-body transition-all duration-300
                                ${isCollapsed ? 'md:w-0 md:overflow-hidden md:opacity-0' : ''}
                            `}
                        >
                            Panel Pengguna
                        </span>
                    </Link>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className={`
                            flex h-12 w-full items-center rounded-xl text-error-dark transition-colors hover:bg-error-light
                            ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4'}
                        `}
                    >
                        <HiOutlineLogout size={24} className="shrink-0" />
                        <span
                            className={`
                                whitespace-nowrap text-btn-sm font-body transition-all duration-300
                                ${isCollapsed ? 'md:w-0 md:overflow-hidden md:opacity-0' : ''}
                            `}
                        >
                            Keluar
                        </span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
