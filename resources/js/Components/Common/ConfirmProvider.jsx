import Modal from '@components/Common/Modal';
import { ConfirmContext } from '@js/Contexts/ConfirmContext';
import { useTranslation } from '@js/i18n';

import { useCallback, useRef, useState } from 'react';

// ============================================================
// CONFIRM PROVIDER
// Holds ONE Modal for the whole layout and hands pages an async confirm().
//
// Every page that deletes something needs the same dialog, and building it
// per page means the same open/close/reset state machine written out again
// each time — which is how three pages ended up on window.confirm instead.
// ============================================================

const EMPTY = {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    cancelLabel: '',
    type: 'warning',
};

export default function ConfirmProvider({ children }) {
    const { t } = useTranslation();
    const [dialog, setDialog] = useState(EMPTY);

    // The promise's resolve function, kept in a ref so answering the dialog
    // resolves the very call that opened it.
    const resolveRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        setDialog({
            isOpen: true,
            title: options.title ?? '',
            message: options.message ?? '',
            confirmLabel: options.confirmLabel ?? '',
            cancelLabel: options.cancelLabel ?? '',
            // Destructive by default: this dialog exists to guard deletions.
            type: options.type ?? 'warning',
        });

        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const settle = useCallback((answer) => {
        setDialog(EMPTY);

        resolveRef.current?.(answer);
        resolveRef.current = null;
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            <Modal
                isOpen={dialog.isOpen}
                type={dialog.type}
                title={dialog.title}
                // Closing by backdrop or Escape means "no", the same as Cancel.
                onClose={() => settle(false)}
                actions={[
                    {
                        label: dialog.cancelLabel || t('common.cancel'),
                        variant: 'secondary',
                        onClick: () => settle(false),
                    },
                    {
                        label: dialog.confirmLabel || t('common.delete'),
                        variant: 'primary',
                        onClick: () => settle(true),
                    },
                ]}
            >
                {dialog.message}
            </Modal>
        </ConfirmContext.Provider>
    );
}
