// ============================================================
// EMPTY STATE
// Tampilan "belum ada data" untuk seluruh aplikasi. Desainnya mengikuti
// halaman Wishlist: maskot pudar, judul, keterangan, lalu CTA opsional.
//
// `size="compact"` memakai desain yang sama persis, hanya diperkecil —
// dipakai di dalam sel tabel admin dan kartu dashboard yang ruangnya sempit.
// ============================================================
const SIZES = {
    default: {
        wrapper: 'gap-4 py-20',
        image: 'h-44 w-44',
        title: 'text-paragraph',
        description: 'text-body',
    },
    compact: {
        wrapper: 'gap-2 py-8',
        image: 'h-24 w-24',
        title: 'text-small',
        description: 'text-micro',
    },
};

export default function EmptyState({
    title,
    description = null,
    image = '/images/mascots/wait.png',
    action = null,
    size = 'default',
}) {
    const styles = SIZES[size] ?? SIZES.default;

    return (
        <div
            className={`
                flex w-full flex-col
                items-center justify-center
                text-center

                ${styles.wrapper}
            `}
        >
            <img
                src={image}
                alt="Maskot NuraLoka"
                className={`
                    object-contain opacity-50

                    ${styles.image}
                `}
            />

            <p
                className={`
                    font-heading text-gray-50

                    ${styles.title}
                `}
            >
                {title}

                {description && (
                    <span
                        className={`
                            block font-body text-gray-30

                            ${styles.description}
                        `}
                    >
                        {description}
                    </span>
                )}
            </p>

            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
