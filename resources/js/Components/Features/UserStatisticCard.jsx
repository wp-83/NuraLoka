export default function UserStatisticCard({
    title,
    value,
    icon,
    variant = 'primary',
}) {
    const variants = {
        primary: {
            text: 'text-primary-100',
            background: 'bg-primary-10',
        },
        green: {
            text: 'text-success-dark',
            background: 'bg-success-light',
        },
        yellow: {
            text: 'text-warning-dark',
            background: 'bg-warning-light',
        },
        red: {
            text: 'text-error-dark',
            background: 'bg-error-light',
        },
        accent: {
            text: 'text-accent-100',
            background: 'bg-accent-10',
        },
    };

    const style = variants[variant] ?? variants.primary;

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
            {/* Background Icon */}
            <div
                className={`
                    pointer-events-none absolute -right-4 -bottom-4
                    opacity-15 transition-all duration-500 ease-out
                    group-hover:-translate-x-1 group-hover:-translate-y-1
                    group-hover:scale-110 group-hover:opacity-20
                    ${style.text}
                `}
            >
                <div className="[&>svg]:h-24 [&>svg]:w-24">
                    {icon}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <p className="font-heading text-paragraph text-primary-70 transition-transform duration-300 group-hover:translate-x-1">
                    {title}
                </p>

                <p
                    className={`
                        mt-1 font-heading text-title
                        transition-transform duration-300
                        group-hover:translate-x-1 font-bold
                        ${style.text}
                    `}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
