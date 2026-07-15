import Button from '@components/Forms/Button';

import { useEffect } from 'react';

export default function Modal({
    isOpen = false,
    onClose,
    type = 'error',
    title,
    children,
    actions = [],
}) {
    /*
    |--------------------------------------------------------------------------
    | Close on Escape
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () =>
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
    }, [isOpen, onClose]);

    /*
    |--------------------------------------------------------------------------
    | Text Colors
    |--------------------------------------------------------------------------
    */

    const textColor = {
        success: 'text-success-dark',
        error: 'text-error-dark',
        warning: 'text-warning-dark',
        info: 'text-info-dark',
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                className="animate-fade-in relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-2 text-center shadow-xl sm:p-6"
            >
                <img
                    src={`/images/alerts/${type}.png`}
                    alt={type}
                    className="mx-auto w-40 object-contain"
                />

                {title && (
                    <h3
                        className={`
                            font-heading
                            text-subtitle
                            font-bold
                            ${
                                textColor[type] ??
                                textColor.info
                            }
                        `}
                    >
                        {title}
                    </h3>
                )}

                {children && (
                    <div className="mt-1 text-body font-body text-gray-70">
                        {children}
                    </div>
                )}

                {actions.length > 0 && (
                    <div className="mt-6 flex gap-3">
                        {actions.map(
                            (action, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        action.variant ??
                                        'primary'
                                    }
                                    onClick={
                                        action.onClick
                                    }
                                    loading={
                                        action.loading
                                    }
                                    disabled={
                                        action.disabled
                                    }
                                    fullWidth
                                >
                                    {action.label}
                                </Button>
                            ),
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
