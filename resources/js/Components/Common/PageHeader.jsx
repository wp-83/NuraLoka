export default function PageHeader({ title, description }) {
    return (
        <div>
            <h1 className="font-heading text-title font-bold text-primary-100">
                {title}
            </h1>

            {description && (
                <p className="mt-1 font-body text-body text-gray-70">
                    {description}
                </p>
            )}
        </div>
    );
}
