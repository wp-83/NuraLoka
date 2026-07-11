import { Head } from "@inertiajs/react";

export default function Error({ status }) {
    const title = {
        400: "Permintaan Tidak Valid",
        401: "Belum Terautentikasi",
        403: "Akses Ditolak",
        404: "Halaman Tidak Ditemukan",
        405: "Metode Tidak Diizinkan",
        408: "Waktu Permintaan Habis",
        419: "Sesi Berakhir",
        500: "Kesalahan Server",
        502: "Gateway Bermasalah",
        503: "Layanan Tidak Tersedia",
    }[status];

    const description = {
        400: "Permintaan tidak dapat dipahami oleh server.",
        401: "Anda perlu masuk untuk mengakses halaman ini.",
        403: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        404: "Halaman yang Anda cari tidak dapat ditemukan.",
        405: "Metode permintaan yang digunakan tidak diizinkan untuk halaman ini.",
        408: "Server kehabisan waktu menunggu permintaan Anda.",
        419: "Sesi Anda telah berakhir. Silakan muat ulang halaman dan coba lagi.",
        500: "Ups, terjadi kesalahan pada server kami.",
        502: "Server menerima respons yang tidak valid.",
        503: "Maaf, layanan sedang tidak tersedia untuk sementara.",
    }[status];

    return (
        <>
            <Head title={`${status} | ${title}`} />

            <div className="container flex h-screen flex-col items-center justify-center gap-0 md:flex-row md:gap-8">
                <img
                    src={`/images/errors/${status}.png`}
                    alt={status}
                    className="w-64 sm:w-72 md:w-80"
                />

                <div className="flex flex-col items-center gap-3 md:items-start">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <h1 className="text-hero font-bold text-primary-100">
                            {status}
                        </h1>

                        <h1 className="text-title text-secondary-85 hidden md:inline">|</h1>

                        <h2 className="text-subtitle text-center md:text-left font-heading text-primary-100">
                            {title}
                        </h2>
                    </div>

                    <p className="text-paragraph font-heading text-center md:text-left">
                        {description}
                    </p>
                </div>
            </div>
        </>
    );
}
