import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaCheck } from 'react-icons/fa';

// Kode ringkas per bahasa untuk tombol (label lengkap datang dari props `locales`).
const SHORT = { id: 'ID', en: 'EN', ko: 'KO' };

/**
 * Pemilih bahasa (id/en/ko). Membaca bahasa aktif & daftar pilihan dari props Inertia,
 * lalu mengarahkan ke /bahasa/{kode} — server menyimpan pilihan ke session & mengembalikan
 * halaman dengan terjemahan baru (preserveScroll agar posisi gulir tetap).
 */
export default function LanguageSwitcher({ className = '' }) {
    const { locale = 'id', locales = {} } = usePage().props;
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const switchTo = (code) => {
        setOpen(false);
        if (code === locale) return;
        router.get(`/bahasa/${code}`, {}, { preserveScroll: true, preserveState: false });
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Pilih bahasa"
                className="
                    flex items-center gap-1.5 rounded-xl px-2.5 py-1.5
                    font-body text-btn-sm text-primary
                    transition-colors hover:bg-primary-10 hover:text-secondary hover:cursor-pointer
                "
            >
                <FaGlobe size={16} className="shrink-0" />
                <span className="font-semibold">{SHORT[locale] ?? String(locale).toUpperCase()}</span>
            </button>

            <div
                className={`
                    absolute right-0 top-full z-[1100] mt-2 w-40
                    rounded-2xl bg-white px-2 py-2 shadow-xl
                    transition-all duration-150
                    ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}
                `}
            >
                {Object.entries(locales).map(([code, label]) => {
                    const active = code === locale;
                    return (
                        <button
                            key={code}
                            type="button"
                            onClick={() => switchTo(code)}
                            className={`
                                flex w-full items-center justify-between gap-2
                                rounded-xl px-3 py-2 font-body text-btn-sm
                                transition-colors
                                ${active ? 'bg-primary-10 text-secondary font-bold' : 'text-primary hover:bg-primary-10 hover:text-secondary'}
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-6 text-left text-micro font-semibold text-secondary">
                                    {SHORT[code] ?? code.toUpperCase()}
                                </span>
                                <span>{label}</span>
                            </span>
                            {active && <FaCheck size={12} className="shrink-0 text-accent" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
