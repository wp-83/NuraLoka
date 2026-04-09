export default function Error({ status, message }) {
    const titles = {
        403: '403 - Forbidden',
        404: '404 - Page Not Found',
        500: '500 - Server Error',
        503: '503 - Service Unavailable',
    }

    const defaultMessages = {
        403: 'Kamu tidak punya akses ke halaman ini.',
        404: 'Halaman yang kamu cari tidak ditemukan.',
        500: 'Terjadi kesalahan pada server.',
        503: 'Server sedang tidak tersedia.',
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f8fafc',
            fontFamily: 'Arial, sans-serif',
            padding: '24px',
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                padding: '32px',
                textAlign: 'center',
            }}>
                <h1 style={{ fontSize: '40px', marginBottom: '12px' }}>
                    {titles[status] || `${status} - Error`}
                </h1>

                <p style={{ color: '#475569', marginBottom: '20px' }}>
                    {message || defaultMessages[status] || 'Terjadi kesalahan.'}
                </p>

                <a
                    href="/"
                    style={{
                        display: 'inline-block',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#111827',
                        color: 'white',
                        textDecoration: 'none',
                    }}
                >
                    Kembali ke Home
                </a>
            </div>
        </div>
    )
}
