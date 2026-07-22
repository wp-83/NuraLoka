import { createContext, useContext } from 'react';

/**
 * Layout-owned confirmation dialog, the counterpart of FlashContext.
 *
 * A page calls `await confirm({ ... })` and gets true or false back, the way
 * window.confirm reads, but the dialog is the application's own Modal component
 * instead of the browser's — which cannot be styled, cannot be translated, and
 * looks like a different product.
 *
 * Defaults to resolving false so a page rendered outside the provider refuses
 * the destructive action rather than performing it unasked.
 */
export const ConfirmContext = createContext(async () => false);

export const useConfirm = () => useContext(ConfirmContext);
