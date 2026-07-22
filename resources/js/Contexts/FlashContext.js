import { createContext, useContext } from 'react';

/**
 * The layout-owned Flash.
 *
 * A page calls showFlash(type, message) to raise a client-side notification (a
 * check-in result, say) through the SAME Flash component the server's Inertia
 * flash uses — never a second instance.
 *
 * Defaults to a no-op so it is safe outside the provider.
 */
export const FlashContext = createContext(() => {});

export const useFlash = () => useContext(FlashContext);
