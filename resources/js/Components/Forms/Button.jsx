const baseClasses =
    'font-body inline-flex min-w-fit items-center justify-center gap-2 rounded-lg border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 w-auto';

const variants = {
    primary: 'bg-primary-100 text-white',
    secondary: 'bg-secondary-100 text-white',
    error: 'bg-error-dark text-white',
    warning: 'bg-warning-dark text-white',
    success: 'bg-success-dark text-white',
    info: 'bg-info-dark text-white',
    gray: 'bg-gray-30 text-black border-none',
    white: 'border-2 border-primary-85 bg-white font-bold text-primary-100 shadow-sm',
    inactive:
        'cursor-not-allowed bg-gray-50 text-white opacity-80 hover:translate-y-0 hover:opacity-80',
};

const sizes = {
    'btn-sm': 'px-2 py-2 text-btn-sm',
    'btn-md': 'px-3 py-2.5 text-btn-md',
    'btn-lg': 'px-4 py-3 text-btn-lg',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'btn-md',
    fullWidth = false,
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    iconLeft,
    iconRight,
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={[
                baseClasses,
                variants[variant] ?? variants.primary,
                sizes[size] ?? sizes['btn-md'],
                fullWidth && 'w-full',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="h-6 w-6 animate-spin rounded-full border-4 border-white/70 border-t-transparent"
                        aria-hidden="true"
                    />
                    <span className={sizes[size]?.split(' ').find(cls => cls.startsWith('text-btn-'))}>
                        {children}
                    </span>
                </>
            ) : (
                <>
                    {iconLeft && (
                        <span className="flex items-center">{iconLeft}</span>
                    )}

                    <span className={sizes[size]?.split(' ').find(cls => cls.startsWith('text-btn-'))}>
                        {children}
                    </span>

                    {iconRight && (
                        <span className="flex items-center">{iconRight}</span>
                    )}
                </>
            )}
        </button>
    );
}
