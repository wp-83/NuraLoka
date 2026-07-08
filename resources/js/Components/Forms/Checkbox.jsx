import { FaCheck } from "react-icons/fa";

export default function Checkbox({
    id,
    name,
    label,
    checked = false,
    onChange,
    disabled = false,
    className = "",
}) {
    return (
        <label
            htmlFor={id}
            className={`flex w-full cursor-pointer items-center gap-2 text-justify ${
                disabled ? "cursor-not-allowed opacity-60" : ""
            } ${className}`}
        >
            <input
                id={id}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="peer sr-only"
            />

            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-primary-85 transition-all duration-200 peer-checked:border-primary-100 peer-checked:bg-primary-85 text-transparent peer-checked:text-white">
                <FaCheck size={16} />
            </span>

            <span className="font-body text-body text-gray-100">
                {label}
            </span>
        </label>
    );
}
