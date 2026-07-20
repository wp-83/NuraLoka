export default function FormSection({
    title,
    description,
    children,
    className = '',
}) {
    return (
        <div
            className={[
                'rounded-xl bg-white p-6 shadow-sm',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <h2 className="font-heading text-subtitle font-bold text-primary-100">
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className="mt-1 font-body text-body text-gray-50">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}
