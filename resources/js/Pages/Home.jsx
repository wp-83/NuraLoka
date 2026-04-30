export default function Home({ title }){
    return (
        <>
            <p>Hai, ini React!</p>
            <p>Test commit and push</p>
            <p>Aku Anessss</p>
            <div className=""><div className=""></div><p>ksandksndlksad</p></div>

             {/* Di dalam komponen React kamu */}
            <a 
                href="/auth/google" 
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
                <img src="/path/to/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
                Lanjutkan dengan Google
            </a>
        </>
    );
}
