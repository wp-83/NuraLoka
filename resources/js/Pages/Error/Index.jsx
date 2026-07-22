import { Head } from "@inertiajs/react";
import { useTranslation } from "@js/i18n";

/**
 * Fallback error text for when the `translations` prop is not shared by the
 * server — an unknown-route 404, or a CSRF 419, both of which happen outside the
 * Inertia pipeline.
 *
 * These values DELIBERATELY mirror lang/{id,en,ko}/error.php.
 */
const FALLBACK = {
    id: {
        titles: {
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
        },
        descriptions: {
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
        },
    },
    en: {
        titles: {
            400: "Bad Request",
            401: "Unauthenticated",
            403: "Access Denied",
            404: "Page Not Found",
            405: "Method Not Allowed",
            408: "Request Timeout",
            419: "Session Expired",
            500: "Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable",
        },
        descriptions: {
            400: "The request could not be understood by the server.",
            401: "You need to sign in to access this page.",
            403: "You do not have permission to access this page.",
            404: "The page you are looking for could not be found.",
            405: "The request method used is not allowed for this page.",
            408: "The server timed out waiting for your request.",
            419: "Your session has expired. Please reload the page and try again.",
            500: "Oops, something went wrong on our server.",
            502: "The server received an invalid response.",
            503: "Sorry, the service is temporarily unavailable.",
        },
    },
    ko: {
        titles: {
            400: "잘못된 요청",
            401: "인증되지 않음",
            403: "접근 거부됨",
            404: "페이지를 찾을 수 없음",
            405: "허용되지 않는 메서드",
            408: "요청 시간 초과",
            419: "세션 만료",
            500: "서버 오류",
            502: "게이트웨이 오류",
            503: "서비스 이용 불가",
        },
        descriptions: {
            400: "서버가 요청을 이해할 수 없습니다.",
            401: "이 페이지에 접근하려면 로그인이 필요합니다.",
            403: "이 페이지에 접근할 권한이 없습니다.",
            404: "찾고 계신 페이지를 찾을 수 없습니다.",
            405: "이 페이지에는 사용된 요청 메서드가 허용되지 않습니다.",
            408: "서버가 요청을 기다리다 시간이 초과되었습니다.",
            419: "세션이 만료되었습니다. 페이지를 새로고침한 후 다시 시도해 주세요.",
            500: "이런, 서버에 문제가 발생했습니다.",
            502: "서버가 잘못된 응답을 받았습니다.",
            503: "죄송합니다. 서비스가 일시적으로 이용 불가합니다.",
        },
    },
};

export default function Error({ status }) {
    const { t, locale } = useTranslation();

    // t() returns the key itself when it finds nothing. When that happens (the
    // translations were not shared), use FALLBACK for this locale, then 'id'.
    const resolve = (group) => {
        const key = `error.${group}.${status}`;
        const translated = t(key);
        if (translated !== key) return translated;

        const table = FALLBACK[locale] ?? FALLBACK.id;
        return table[group][status] ?? FALLBACK.id[group][status] ?? "";
    };

    const title = resolve("titles");
    const description = resolve("descriptions");

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
