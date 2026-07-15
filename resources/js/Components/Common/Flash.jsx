import IconButton from '@components/Common/IconButton';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { MdOutlineClose } from 'react-icons/md';

export default function Flash({
    type = 'success',
    message = '',
    onClose,
}) {
    const [visible, setVisible] = useState(false);

    const flashRef = useRef(null);
    const closeTimerRef = useRef(null);
    const isClosingRef = useRef(false);

    /*
    |--------------------------------------------------------------------------
    | Close Flash
    |--------------------------------------------------------------------------
    */

    const closeFlash = useCallback(() => {
        if (isClosingRef.current) {
            return;
        }

        isClosingRef.current = true;

        // Jalankan animasi keluar.
        setVisible(false);

        // Tunggu animasi 300ms selesai.
        closeTimerRef.current = setTimeout(() => {
            onClose?.();
        }, 300);
    }, [onClose]);

    /*
    |--------------------------------------------------------------------------
    | Flash Lifecycle
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        isClosingRef.current = false;

        // Jalankan animasi masuk.
        const showTimer = requestAnimationFrame(() => {
            setVisible(true);
        });

        // Simpan kondisi overflow sebelumnya.
        const originalOverflow =
            document.body.style.overflow;

        // Kunci scroll halaman.
        document.body.style.overflow = 'hidden';

        // Tutup otomatis setelah 4 detik.
        const autoCloseTimer = setTimeout(() => {
            closeFlash();
        }, 4000);

        /*
        |--------------------------------------------------------------------------
        | Click Outside
        |--------------------------------------------------------------------------
        */

        const handleClickOutside = (event) => {
            if (
                flashRef.current &&
                !flashRef.current.contains(
                    event.target
                )
            ) {
                closeFlash();
            }
        };

        document.addEventListener(
            'pointerdown',
            handleClickOutside
        );

        /*
        |--------------------------------------------------------------------------
        | Cleanup
        |--------------------------------------------------------------------------
        */

        return () => {
            cancelAnimationFrame(showTimer);

            clearTimeout(autoCloseTimer);
            clearTimeout(closeTimerRef.current);

            document.body.style.overflow =
                originalOverflow;

            document.removeEventListener(
                'pointerdown',
                handleClickOutside
            );
        };
    }, [closeFlash]);

    /*
    |--------------------------------------------------------------------------
    | Colors
    |--------------------------------------------------------------------------
    */

    const loadingColor = {
        success: 'bg-success-dark',
        error: 'bg-error-dark',
        warning: 'bg-warning-dark',
        info: 'bg-info-dark',
    };

    return (
        <div
            ref={flashRef}
            className={`
                fixed
                left-1/2
                top-0
                z-[1000]
                min-h-8
                min-w-8
                w-max
                max-w-[calc(100vw-4rem)]
                -translate-x-1/2
                overflow-hidden
                rounded-lg
                bg-white
                transition-all
                duration-300
                ease-in-out
                ${
                    visible
                        ? 'translate-y-6 opacity-100 shadow-[0_0_0_100vmax_rgba(0,0,0,.15)]'
                        : '-translate-y-full opacity-0'
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

                    <p className="font-body text-body">
                        {message}
                    </p>
                </div>

                <IconButton
                    icon={
                        <MdOutlineClose size={24} />
                    }
                    onClick={closeFlash}
                />
            </div>

            <div
                className={`
                    h-1
                    animate-progress
                    ${
                        loadingColor[type] ??
                        loadingColor.info
                    }
                `}
            />
        </div>
    );
}
