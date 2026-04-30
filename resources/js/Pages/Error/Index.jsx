import { Head, Link } from "@inertiajs/react";
import '@css/Init.css';
import '@css/Error/Error.css';

export default function Error({ status }) {
    const title = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Page Not Found",
        408: "Request Timeout",
        419: "Page Expired",
        500: "Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    }[status];

    const description = {
        400: "Permintaan tidak dapat dipahami oleh server.",
        401: "Anda perlu masuk untuk mengakses halaman ini.",
        403: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        404: "Halaman yang Anda cari tidak dapat ditemukan.",
        408: "Server kehabisan waktu menunggu permintaan Anda.",
        419: "Sesi Anda telah berakhir. Silakan muat ulang halaman dan coba lagi.",
        500: "Ups, terjadi kesalahan pada server kami.",
        502: "Server menerima respons yang tidak valid.",
        503: "Maaf, layanan sedang tidak tersedia untuk sementara.",
    }[status];

    return (
        <>
            <Head title={`${status} | ${title}`} />

            <div className="container error-container">
                <img src={`/images/errors/${status}.png`} alt={status} className="error-icon" />
                <div className='content'>
                    <div className='error-main-content'>
                        <h1 className="hero bold">{status}</h1>
                        <h1 style={{ color: 'var(--secondary-85)' }}>|</h1>
                        <h1 className="subtitle">{title}</h1>
                    </div>
                    <p className="paragraph">{description}</p>
                </div>
            </div>
        </>
    );
}
