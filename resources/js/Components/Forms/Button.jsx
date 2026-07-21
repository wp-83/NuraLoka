const baseClasses =
    'font-body inline-flex min-w-fit items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-70 focus:outline-none disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:opacity-70';

const variants = {
    primary: 'bg-primary-100 text-white',
    secondary: 'bg-secondary-100 text-white',
    error: 'bg-error-dark text-white',
    warning: 'bg-warning-dark text-white',
    success: 'bg-success-dark text-white',
    info: 'bg-info-dark text-white',
    gray: 'border-none bg-gray-30 text-black',
    white: 'border-2 border-primary-85 bg-white font-bold text-primary-100 shadow-sm',
    inactive:
        'cursor-not-allowed bg-gray-50 text-white opacity-80 hover:translate-y-0 hover:opacity-80',
};

const sizes = {
    'btn-sm': 'px-2 py-2 text-btn-sm',
    'btn-md': 'px-3 py-2.5 text-btn-md',
    'btn-lg': 'px-4 py-3 text-btn-lg',
};

const iconOnlySizes = {
    'btn-sm': 'h-9 w-9 p-0 text-btn-sm',
    'btn-md': 'h-10 w-10 p-0 text-btn-md',
    'btn-lg': 'h-12 w-12 p-0 text-btn-lg',
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
    unstyled = false,
    ...props
}) {
    const isDisabled =
        disabled || loading;

    // Kontrol yang tampilannya memang bukan tombol biasa — sakelar visibilitas,
    // tombol overlay lightbox, ubin foto, baris saran lokasi, ikon hapus di
    // dalam input — tetap memakai komponen ini agar perilakunya seragam
    // (type="button" secara default, penanganan disabled), tapi gaya visualnya
    // ditentukan sendiri lewat className.
    //
    // Base class Button tidak bisa sekadar ditimpa: Tailwind menentukan pemenang
    // dari urutan CSS, bukan urutan string, jadi `p-0` akan kalah dari `px-3`.
    // Children juga dibiarkan apa adanya (tidak dibungkus <span>) supaya layout
    // flex milik pemanggil tidak berubah.
    if (unstyled) {
        return (
            <button
                type={type}
                disabled={isDisabled}
                className={className}
                {...props}
            >
                {children}
            </button>
        );
    }

    const isIconOnly =
        !children &&
        (iconLeft || iconRight);

    const sizeClasses = isIconOnly
        ? iconOnlySizes[size] ??
          iconOnlySizes['btn-md']
        : sizes[size] ??
          sizes['btn-md'];

    const textSize = sizeClasses
        .split(' ')
        .find((cls) =>
            cls.startsWith('text-btn-'),
        );

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={[
                baseClasses,
                variants[variant] ??
                    variants.primary,
                sizeClasses,
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

                    {children && (
                        <span
                            className={textSize}
                        >
                            {children}
                        </span>
                    )}
                </>
            ) : (
                <>
                    {iconLeft && (
                        <span className="flex items-center justify-center">
                            {iconLeft}
                        </span>
                    )}

                    {children && (
                        <span
                            className={textSize}
                        >
                            {children}
                        </span>
                    )}

                    {iconRight && (
                        <span className="flex items-center justify-center">
                            {iconRight}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}
