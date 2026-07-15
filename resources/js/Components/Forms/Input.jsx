import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    icon,
    iconRight,
    error,
    helperText,
    required = false,
    disabled = false,
    fullWidth = true,
    rows = 4,
    className = "",
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const inputType =
        type === "password"
            ? showPassword
                ? "text"
                : "password"
            : type;

    const wrapperClass = [
        "flex flex-col gap-1.5",
        fullWidth && "w-full",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const containerClass = [
        "flex overflow-hidden rounded-lg transition-all duration-200 outline-none border-1 border-primary-100",

        disabled && "bg-gray-30",

        !disabled &&
            !error &&
            focused &&
            "bg-primary-10",

        !disabled &&
            !error &&
            !focused &&
            "bg-white",
    ]
        .filter(Boolean)
        .join(" ");

    const inputWrapperClass = [
        "flex flex-1 items-center transition-all duration-200",

        disabled && "border-primary-100",

        error &&
            "border-error-dark bg-red-50",

        !disabled &&
            !error &&
            focused &&
            "bg-primary-10",

        !disabled &&
            !error &&
            !focused &&
            "border-gray-300 bg-white hover:bg-secondary-10",
    ]
        .filter(Boolean)
        .join(" ");

    const inputClass = [
        "w-full bg-transparent px-4 py-3",
        "font-body text-body",
        "placeholder:text-gray-30 placeholder:italic placeholder:font-body",
        "focus:outline-none",
        "disabled:cursor-not-allowed",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClass}>
            {label && (
                <label
                    htmlFor={name}
                    className="font-heading text-paragraph text-primary-100"
                >
                    {label}

                    {required && (
                        <span className="text-error-dark ml-1">*</span>
                    )}
                </label>
            )}

            {type === "textarea" ? (
                <div className={containerClass}>
                    <textarea
                        id={name}
                        name={name}
                        rows={rows}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={props.required}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={`${inputClass} resize-none px-4 py-3 w-full bg-transparent`}
                        {...props}
                    />
                </div>
            ) : (
                <div className={containerClass}>
                    {icon && (
                        <div className="flex w-12 items-center justify-center bg-primary-100 text-white">
                            {icon}
                        </div>
                    )}

                    <div className={inputWrapperClass}>
                        <input
                            id={name}
                            name={name}
                            type={inputType}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            className={`${inputClass} ${
                                icon ? "pl-3" : ""
                            } ${
                                type === "password" || iconRight ? "pr-3" : ""
                            }`}
                            {...props}
                        />

                        {type === "password" ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="px-4 text-gray-50 hover:text-primary-100"
                            >
                                {showPassword ? (
                                    <FaEye size={20} />
                                ) : (
                                    <FaEyeSlash size={20} />
                                )}
                            </button>
                        ) : (
                            iconRight && (
                                <div className="px-4 text-gray-50">
                                    {iconRight}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-error-dark text-small italic">
                    {error}
                </p>
            )}
        </div>
    );
}
