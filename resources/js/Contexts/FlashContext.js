import { createContext, useContext } from 'react';

/**
 * Flash terpusat milik layout. Halaman memanggil showFlash(type, message) untuk
 * menampilkan notifikasi client-side (mis. hasil check-in) lewat komponen Flash
 * yang SAMA dengan flash server (Inertia) — tidak membuat instance Flash baru.
 * Default no-op agar aman bila dipakai di luar provider.
 */
export const FlashContext = createContext(() => {});

export const useFlash = () => useContext(FlashContext);
