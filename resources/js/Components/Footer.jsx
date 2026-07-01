import { FiInstagram } from 'react-icons/fi';
import { FaTiktok, FaYoutube, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { HiLocationMarker } from 'react-icons/hi';

/*
  Grid System (Figma spec):
  - Type    : Stretch
  - Width   : Auto
  - Margin  : 120px  → px-[120px] (dalam CSS, margin grid Figma setara dengan padding container)
  - Gutter  : 20px   → gap-5
  - Columns : 12
*/
export default function Footer() {
    return (
        <footer className="relative w-full bg-amber-50 border-t border-amber-200 pt-12 pb-6 overflow-hidden">
            {/* ── Background pattern — clipPath menggantikan overflow-hidden ── */}
            <img
                src="/images/patterns/object.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.08]"
                style={{ clipPath: 'inset(0)' }}
            />

            {/* ── Content wrapper with responsive padding ── */}
            <div className="relative container mx-auto px-4 md:px-6 lg:px-8">

                {/* ── Row 1: Branding (col 4–10, center) ── */}
                <div className="grid grid-cols-12 gap-5 mb-8">
                    <div className="col-start-4 col-end-10 flex flex-col items-center">
                        <div className="w-[234px] mb-2">
                            <img
                                src="/images/logo/with-tagline.png"
                                alt="NuraLoka"
                                className="w-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 text-center max-w-[22rem] leading-relaxed">
                            <span className="font-bold text-orange-600">Nura</span>
                            <span className="font-bold text-green-800">Loka</span>
                            {' '}hadir menjadi teman perjalanan Anda dalam eksplorasi di seluruh wilayah Nusantara.
                        </p>
                    </div>
                </div>

                {/* ── Row 2: Kontak | Mascot | Sosmed ── */}
                <div className="grid grid-cols-12 gap-5 mb-8 items-start">

                    {/* Kontak Kami: col 1–4 */}
                    <div className="col-start-1 col-end-5">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Kontak Kami
                        </h4>
                        <ul className="flex flex-col gap-2 text-xs text-gray-600 list-none p-0 m-0">
                            <li className="flex items-start gap-2">
                                <HiLocationMarker size={14} className="text-amber-800 flex-shrink-0 mt-0.5" />
                                <span>Jl. Pakuan No. 3, Sumur Batu, Kec. Babakan Madang, Kabupaten Bogor, Jawa Barat 16810, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-800 text-xs">✉</span>
                                <span>nuraloka.team@gmail.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-800 text-xs">📞</span>
                                <span>345 333 55</span>
                            </li>
                        </ul>
                    </div>

                    {/* Mascot: col 5–9, center */}
                    <div className="col-start-5 col-end-9 flex flex-col items-center justify-center">
                        <div className="w-28">
                            <img
                                src="/images/mascots/car.png"
                                alt="mascot"
                                className="w-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <p className="text-sm mt-1">
                            <span className="text-orange-600">Mantapkan </span>
                            <span className="text-green-800">Langkahmu!</span>
                        </p>
                    </div>

                    {/* Sosial Media: col 9–13 */}
                    <div className="col-start-9 col-end-13">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Sosial Media Kami
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2"><FiInstagram size={13} /><span>nuraloka.id</span></div>
                            <div className="flex items-center gap-2"><FaFacebook size={13} /><span>NuraLoka Indonesia</span></div>
                            <div className="flex items-center gap-2"><FaTiktok size={13} /><span>nuraloka_id</span></div>
                            <div className="flex items-center gap-2"><FaYoutube size={13} /><span>NuraLoka Indonesia</span></div>
                            <div className="flex items-center gap-2"><FaXTwitter size={13} /><span>nuravers</span></div>
                        </div>
                    </div>

                </div>

                {/* ── Row 3: Copyright ── */}
                <div className="border-t border-amber-200 pt-4 text-center text-xs text-gray-500">
                    © 2026{' '}
                    <span className="font-bold text-orange-600">Nura</span>
                    <span className="font-bold text-green-800">Loka</span>
                    . Seluruh Hak Cipta Dilindungi.
                </div>
            </div>
        </footer>
    );
}