import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FiMapPin } from 'react-icons/fi';

const NAV_LINKS = [
    { label: 'Beranda', routeName: '/' },
    { label: 'Jelajah', routeName: 'explore.index' },
    { label: 'Tantangan', routeName: null },
    { label: 'Impian', routeName: 'wishlist.index' },
    { label: 'Album', routeName: null },
];

export default function Navbar() {
    const { url } = usePage();

    const isActive = (routeName) => {
        if (!routeName) return false;
        if (routeName === '/') return url === '/';
        return route().current(routeName);
    };

    return (
        <nav className="sticky top-0 z-[999] w-full bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto">
                <div className="grid grid-cols-12 items-center py-2 gap-5">
                    <div className="col-start-1 col-end-3 flex items-center">
                        <Link href="/" style={{ lineHeight: 0 }}>
                            <img
                                src="/images/logo/with-tagline.png"
                                alt="NuraLoka"
                                className="h-13 w-auto object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </Link>
                    </div>
                    <ul className="col-start-4 col-end-10 hidden md:flex items-center justify-center gap-1 list-none">
                        {NAV_LINKS.map((item) => (
                            <li key={item.label} className="px-4">
                                {item.routeName ? (
                                    <Link
                                        href={item.routeName === '/' ? '/' : route(item.routeName)}
                                        className={`inline-flex flex-col items-start text-sm font-medium transition-colors no-underline ${isActive(item.routeName) ? 'text-green-700' : 'text-gray-700 hover:text-green-600'}`}
                                    >
                                        <span className="flex items-center gap-1">
                                            {isActive(item.routeName) && <FiMapPin size={13} />}
                                            {item.label}
                                        </span>
                                        <div className={`h-0.5 w-1/2 mt-0.5 rounded-full ${isActive(item.routeName) ? 'bg-green-700' : 'bg-transparent'}`} />
                                    </Link>
                                ) : (
                                    <span className="inline-flex flex-col items-center text-sm font-medium text-gray-700 cursor-not-allowed">
                                        {item.label}
                                        <div className="h-0.5 w-full mt-0.5 bg-transparent" />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="col-start-11 col-end-13 flex items-center justify-end gap-3">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-bold text-gray-800 leading-tight">Jayadi Christopher Alam</span>
                            <span className="text-xs text-gray-400">Pemula</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-amber-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img
                                src="/images/defaults/avatar.png"
                                alt="avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
