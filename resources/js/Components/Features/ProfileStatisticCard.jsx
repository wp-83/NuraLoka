export default function StatCard({
    title = "",
    value = "",
    description = "",
    image = "",
    flipImage = false,
}) {
    return (
        <div className="relative min-h-32 overflow-hidden rounded-xl bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative z-10">
                <h3 className="font-heading text-paragraph font-bold text-primary">
                    {title}
                </h3>

                <div className="mt-2 flex items-end gap-2">
                    <span className="font-heading text-title font-bold leading-none text-secondary sm:text-hero">
                        {value ?? 0}
                    </span>

                    <span className="mb-1 font-body text-body text-gray">
                        {description}
                    </span>
                </div>
            </div>

            {image && (
                <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className={`
                        pointer-events-none absolute -bottom-5 -right-5
                        w-32 object-contain object-right-bottom
                        opacity-30 grayscale
                        ${flipImage ? "-scale-x-100" : ""}
                    `}
                />
            )}
        </div>
    );
}
