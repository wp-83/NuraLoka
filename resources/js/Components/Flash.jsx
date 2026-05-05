import '@css/Init.css';
import '@css/Components/Flash.css';
import { MdOutlineClose } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';

// success, warning, info, error
export default function Flash({ type="success", message="message" }){
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
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    return (
        <>
            <div className={`flash ${(visible) ? 'flash-show' : ''}`} ref={flashRef}>
                <div className='flash-content'>
                    <div className='main-content'>
                        <img src={`/images/alerts/${type}.png`} alt="image" />
                        <p className='body'>{message}</p>
                    </div>
                    <div className='icon-btn' onClick={() => setVisible(false)}>
                        <MdOutlineClose className='icon' />
                    </div>
                </div>
                <div className={`flash-loading-bar ${type}`}></div>
            </div>
        </>
    );
}
