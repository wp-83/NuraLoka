import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown({
    label,
    name,
    id,
    value,
    onChange,
    options = [],
    placeholder = "Pilih salah satu",
    icon,
    error,
    disabled = false,
    required = false,
    className = "",
}) {
    const [focused, setFocused] = useState(false);

    const wrapperClass = [
        "flex flex-col gap-1.5 my-2",
        "w-full",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const containerClass = [
        "flex overflow-hidden rounded-lg border border-primary-100 transition-all duration-200",

        disabled && "bg-gray-30",

        error && "border-error-dark bg-red-50",

        !disabled &&
            !error &&
            focused &&
            "bg-primary-10",

        !disabled &&
            !error &&
            !focused &&
            "bg-white hover:bg-secondary-10",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClass}>
            {label && (
                <label
                    htmlFor={id ?? name}
                    className="font-heading text-paragraph text-primary-100"
                >
                    {label}

                    {required && (
                        <span className="ml-1 text-error-dark">*</span>
                    )}
                </label>
            )}

            <div className={containerClass}>
                {icon && (
                    <div className="flex w-12 items-center justify-center bg-primary-100 text-white">
                        {icon}
                    </div>
                )}

                <div className="relative flex flex-1 items-center">
                    <select
                        id={id ?? name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={`
                            w-full appearance-none bg-transparent
                            px-4 py-3 pr-10
                            font-body text-body
                            focus:outline-none
                            disabled:cursor-not-allowed
                            ${
                                value
                                    ? "text-black"
                                    : "font-body italic text-gray-30"
                            }
                        `}
                    >
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>

                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <FaChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 text-gray-50"
                    />
                </div>
            </div>

            {error && (
                <p className="text-error-dark text-micro italic">
                    {error}
                </p>
            )}
        </div>
    );
}
