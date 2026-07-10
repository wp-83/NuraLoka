import '@css/app.css';
import { MdOutlineClose } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import IconButton from '@components/Common/IconButton';

export default function Flash({
    type = "success",
    message = "message",
}) {
    const [visible, setVisible] = useState(false);
    const flashRef = useRef(null);

    useEffect(() => {
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, 4000);

        const handleClickOutside = (e) => {
            if (flashRef.current && !flashRef.current.contains(e.target)) {
                setVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const loadingColor = {
        success: "bg-success-dark",
        error: "bg-error-dark",
        warning: "bg-warning-dark",
        info: "bg-info-dark",
    };

    return (
        <div
            ref={flashRef}
            className={`
                absolute left-1/2 top-0 z-[1000]
                w-max max-w-[calc(100vw-4rem)]
                min-h-8 min-w-8
                -translate-x-1/2
                overflow-hidden rounded-lg bg-white
                transition-all duration-300 ease-in-out
                ${
                    visible
                        ? "translate-y-6 opacity-100 shadow-[0_0_0_100vmax_rgba(0,0,0,.15)]"
                        : "-translate-y-full opacity-0"
                }
            `}
        >
            <div className="flex items-center justify-between gap-6 px-3 py-1">
                <div className="flex items-center gap-1">
                    <img
                        src={`/images/alerts/${type}.png`}
                        alt={type}
                        className="w-12"
                    />

                    <p className="text-body font-body">
                        {message}
                    </p>
                </div>

                <IconButton icon={<MdOutlineClose size={24} />} onClick={() => setVisible(false)} />
            </div>

            <div
                className={`h-1 animate-progress ${loadingColor[type]}`}
            />
        </div>
    );
}
