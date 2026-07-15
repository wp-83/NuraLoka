import { useEffect } from 'react';
import Button from '@components/Forms/Button';

export default function Modal({
    isOpen = false,
    onClose,
    type = 'error',
    title,
    children,
    actions = [],
}) {
    // Close on Escape key while the modal is open
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

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
                className="animate-fade-in relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl sm:p-8"
            >
                <img
                    src={`/images/alerts/${type}.png`}
                    alt={type}
                    className="mx-auto h-40 w-40 object-contain"
                />

                {title && (
                    <h3 className="mt-4 font-heading text-paragraph font-semibold text-gray-100">
                        {title}
                    </h3>
                )}

                {children && (
                    <div className="mt-2 text-body text-gray-70">{children}</div>
                )}

                {actions.length > 0 && (
                    <div className="mt-6 flex gap-3">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant ?? 'primary'}
                                onClick={action.onClick}
                                loading={action.loading}
                                disabled={action.disabled}
                                fullWidth
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
