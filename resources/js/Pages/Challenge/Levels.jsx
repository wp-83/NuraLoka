import { Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import Button from '@components/Forms/Button';
import { useTranslation } from '@js/i18n';
import { IoChevronBackSharp } from 'react-icons/io5';

/**
 * Bentuk jalan untuk dua rasio layar.
 *
 * Satu jalur saja tidak cukup: bentuk lebar 800×900 kalau dipaksakan ke layar
 * ponsel hanya setinggi ±386px — jalannya jadi kecil dan penanda levelnya
 * berdesakan. Versi ponsel dibuat sempit-tinggi supaya memakai ruang vertikal
 * yang memang tersedia di sana.
 *
 * Keduanya memakai Bézier kubik dengan titik kendali SEGARIS di tiap sambungan,
 * sehingga belokannya mengalir tanpa sudut patah.
 */
const ROAD_WIDE = {
    width: 800,
    height: 900,
    d: `M 120 90
        C 260 60, 380 110, 470 190
        C 560 270, 620 330, 600 420
        C 580 510, 440 520, 330 470
        C 220 420, 150 490, 165 590
        C 180 690, 320 730, 440 700
        C 560 670, 650 720, 690 830`,
};

const ROAD_TALL = {
    width: 400,
    height: 1150,
    d: `M 95 90
        C 175 70, 255 120, 300 210
        C 345 300, 350 380, 295 450
        C 240 520, 140 530, 100 610
        C 60 690, 55 780, 130 850
        C 205 920, 290 950, 305 1050`,
};

export default function Levels({ totalPoints = 0, currentLevel = {}, allLevels = [] }) {
    const { t } = useTranslation();
    const pathRef = useRef(null);
    const [carPos, setCarPos] = useState({ x: 0, y: 0 });
    const [labelVisible, setLabelVisible] = useState(false);
    const [isDriving, setIsDriving] = useState(false);
    // Sekali true dan tidak pernah kembali false — menandai garis berwarna sudah
    // boleh terisi. Berbeda dari isDriving yang kembali false setelah animasi
    // selesai (kalau dipakai, garisnya akan menyusut lagi ke nol).
    const [progressStarted, setProgressStarted] = useState(false);
    const [pathReady, setPathReady] = useState(false);

    // Pilih bentuk jalan sesuai lebar layar. Memakai matchMedia, bukan sekadar
    // kelas Tailwind, karena viewBox & pembagi posisi persen ikut berubah.
    const [road, setRoad] = useState(ROAD_WIDE);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 639px)');

        const apply = () => setRoad(query.matches ? ROAD_TALL : ROAD_WIDE);

        apply();
        query.addEventListener('change', apply);

        return () => query.removeEventListener('change', apply);
    }, []);

    // Calculate target percentage along the path
    const currentIdx = Math.max(0, allLevels.findIndex(l => l.name === currentLevel.name));
    const nextIdx = currentIdx < allLevels.length - 1 ? currentIdx + 1 : currentIdx;
    const min = allLevels[currentIdx]?.min || 0;
    const max = allLevels[nextIdx]?.min || min;

    let segmentPercent = 0;
    if (max > min) {
        segmentPercent = Math.min(1, Math.max(0, (totalPoints - min) / (max - min)));
    }
    const globalPercent = Math.min(1, (currentIdx + segmentPercent) / (allLevels.length - 1 || 1));

    // Animate the car along the SVG path
    const animateCar = useCallback(() => {
        const path = pathRef.current;
        if (!path) return;

        const totalLength = path.getTotalLength();
        const targetLength = totalLength * globalPercent;
        const duration = 2500; // ms
        const startTime = performance.now();

        setIsDriving(true);

        // Menyalakan garis berwarna pada saat yang sama dengan mobil mulai jalan.
        // Tanpa ini garisnya sudah bergerak sejak jalur selesai diukur, 400 ms
        // sebelum mobilnya berangkat, sehingga keduanya tidak pernah sejajar.
        setProgressStarted(true);

        // Set initial position
        const startPoint = path.getPointAtLength(0);
        setCarPos({ x: startPoint.x, y: startPoint.y });

        const step = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentLength = targetLength * eased;
            const point = path.getPointAtLength(currentLength);
            setCarPos({ x: point.x, y: point.y });

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Animation complete
                setIsDriving(false);
                setLabelVisible(true);
            }
        };

        requestAnimationFrame(step);
    }, [globalPercent]);

    // Start animation after component mount and path is ready
    useEffect(() => {
        if (!pathReady) return;
        const timer = setTimeout(() => animateCar(), 400);
        return () => clearTimeout(timer);
    }, [pathReady, animateCar]);

    // Detect when path ref is available
    useEffect(() => {
        const checkPath = () => {
            if (pathRef.current) {
                setPathReady(true);
            } else {
                requestAnimationFrame(checkPath);
            }
        };
        checkPath();
    }, []);

    // Posisi penanda level DIHITUNG dari jalur SVG yang sama dengan yang dilalui
    // mobil, memakai pembagian jarak yang sama dengan globalPercent di atas.
    //
    // Sebelumnya koordinatnya ditulis tangan dan tidak menempel di jalur — mis.
    // penanda terakhir di (550, 670) padahal jalurnya berakhir di (700, 800).
    // Akibatnya mobil tidak pernah berhenti tepat di penanda levelnya.
    const [positions, setPositions] = useState([]);

    // Panjang jalur SEBENARNYA, diukur dari elemen SVG-nya.
    //
    // Sebelumnya nilai ini ditulis tetap 2600 untuk garis berwarna, sementara
    // mobil memakai path.getTotalLength() yang sesungguhnya. Karena keduanya
    // memakai panjang yang berbeda, ujung garis berwarna tidak pernah berhimpit
    // dengan posisi mobil.
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        const path = pathRef.current;

        if (!pathReady || !path || allLevels.length === 0) return;

        const totalLength = path.getTotalLength();
        const segments = allLevels.length - 1 || 1;

        setPathLength(totalLength);

        setPositions(
            allLevels.map((_, idx) => {
                const point = path.getPointAtLength(
                    (totalLength * idx) / segments,
                );

                return { left: point.x, top: point.y };
            }),
        );
        // 'road' ikut jadi dependensi: saat bentuk jalan berganti (mis. layar
        // diputar), panjang & posisinya harus dihitung ulang.
    }, [pathReady, allLevels, road]);

    // Garis berwarna memakai panjang yang sama dengan mobil, sehingga ujungnya
    // tepat di posisi mobil. Sebelum terukur, dipakai 1 agar dasharray/offset
    // saling meniadakan — garisnya tersembunyi, bukan tampil penuh sesaat.
    const strokeLength = pathLength || 1;
    const fillLength = progressStarted ? strokeLength * globalPercent : 0;

    return (
        <>
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="py-8 relative">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-heading text-title font-bold text-primary">{t('challenge.levels_page_title')}</h1>
                        <RegionalGreeting phrase="challenge_levels" className="local-language text-paragraph mb-6 mt-1" />

                        <Link href={route('challenge.index')}>
                            <Button iconLeft={<IoChevronBackSharp />}>
                                {t('challenge.back_to_challenge')}
                            </Button>
                        </Link>
                    </div>

                    {/* Winding Road Visualization */}
                    <div className="relative w-full overflow-visible py-6 my-6 flex justify-center sm:py-10 sm:my-10">
                        {/*
                            Rasio kontainer DIKUNCI 800:900, sama dengan viewBox SVG.
                            Sebelumnya tingginya dipatok 900px sementara lebarnya
                            mengikuti layar — di layar sempit SVG-nya menyusut dan
                            menyisakan ruang kosong tinggi di atas & bawah, karena
                            preserveAspectRatio bawaan memuat gambar di tengah.
                            Dengan rasio terkunci, posisi persen menjadi tepat.
                        */}
                        <div
                            className="relative w-full max-w-[800px]"
                            // Rasio mengikuti viewBox jalan yang sedang dipakai,
                            // supaya SVG mengisi penuh tanpa ruang kosong dan
                            // posisi persen penanda tetap tepat.
                            style={{ aspectRatio: `${road.width} / ${road.height}` }}
                        >
                            {/* Winding road SVG */}
                            {/* drop-shadow-md dilepas: bayangan kini dari filter
                                roadShadow yang hanya mengenai badan jalan, bukan
                                seluruh isi SVG. */}
                            <svg
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${road.width} ${road.height}`}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute top-0 left-0 w-full h-full"
                            >
                                <defs>
                                    <path
                                        // key memaksa elemen dibuat ulang saat
                                        // bentuk jalan berganti, sehingga
                                        // getTotalLength() membaca jalur baru.
                                        key={road.width}
                                        ref={pathRef}
                                        id="mainPath"
                                        d={road.d}
                                    />
                                    {/* Bayangan lembut di bawah badan jalan. */}
                                    <filter
                                        id="roadShadow"
                                        x="-20%"
                                        y="-20%"
                                        width="140%"
                                        height="140%"
                                    >
                                        <feDropShadow
                                            dx="0"
                                            dy="6"
                                            stdDeviation="7"
                                            floodColor="#5A3812"
                                            floodOpacity="0.22"
                                        />
                                    </filter>

                                    <style>
                                        {`
                                        /* Warna jalan mengikuti tema situs.
                                           Belum ditempuh: primary-30 (#D5B9AA) —
                                           masih satu keluarga warna, tapi pudar. */
                                        .path-bg { stroke: #D5B9AA; }

                                        /* Sudah ditempuh: primary-100 (#5A3812),
                                           warna utama tema. Kontras terang-gelap
                                           dalam satu keluarga inilah yang menandai
                                           progres. */
                                        .path-fill {
                                            stroke: #5A3812;
                                            stroke-dasharray: ${strokeLength};
                                            stroke-dashoffset: ${strokeLength - fillLength};
                                            /* Harus sama dengan animasi mobil:
                                               2500 ms, ease-out cubic (lihat
                                               animateCar). Kurva yang berbeda
                                               membuat garis & mobil berpisah di
                                               tengah animasi meski finis bareng. */
                                            transition: stroke-dashoffset 2.5s cubic-bezier(0.33, 1, 0.68, 1);
                                        }
                                        /* Marka tengah putus-putus. Proporsi garis
                                           pendek : jeda panjang meniru marka jalan
                                           sungguhan (sebelumnya 12:12 terlihat
                                           seperti tangga, bukan marka). */
                                        .path-dash-bg {
                                            stroke: #F3F4F2;
                                            stroke-dasharray: 16 26;
                                            stroke-opacity: 0.9;
                                        }

                                        @keyframes car-bounce {
                                            0%, 100% { transform: translateY(0); }
                                            50% { transform: translateY(-8px); }
                                        }

                                        @keyframes car-wiggle {
                                            0%, 100% { transform: rotate(0deg); }
                                            25% { transform: rotate(-4deg); }
                                            75% { transform: rotate(4deg); }
                                        }

                                        .car-arrived {
                                            animation: car-bounce 0.5s ease-in-out 3;
                                        }

                                        .car-driving {
                                            animation: car-wiggle 0.2s ease-in-out infinite;
                                        }
                                        `}
                                    </style>
                                </defs>

                                {/* Jalan disusun berlapis dari luar ke dalam supaya
                                    terbaca seperti jalan sungguhan:

                                      bahu jalan → marka tepi → aspal → marka tengah

                                    Marka tepi dibuat dengan menumpuk aspal yang
                                    sedikit lebih sempit di atas lapisan putih,
                                    sehingga menyisakan garis putih tipis di kedua
                                    sisi — SVG tidak bisa menggambar garis sejajar
                                    dari satu path. */}

                                {/* Bahu jalan (tanah/kerikil) + bayangan */}
                                <use
                                    href="#mainPath"
                                    stroke="#FFF0E8"
                                    strokeWidth="40"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#roadShadow)"
                                />

                                {/* Lapisan marka tepi */}
                                <use href="#mainPath" stroke="#F3F4F2" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Aspal belum ditempuh */}
                                <use href="#mainPath" className="path-bg" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Aspal sudah ditempuh */}
                                <use href="#mainPath" className="path-fill" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Marka tengah putus-putus */}
                                <use href="#mainPath" className="path-dash-bg" strokeWidth="3" strokeLinecap="butt" strokeLinejoin="round" />
                            </svg>

                            {/* Level Markers */}
                            {allLevels.map((level, idx) => {
                                const pos = positions[idx];

                                // Menunggu jalur siap; tanpa ini penanda sempat
                                // menumpuk di pojok sebelum posisinya dihitung.
                                if (!pos) return null;

                                const isCurrent = level.name === currentLevel?.name;

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            absolute -translate-x-1/2 -translate-y-1/2
                                            whitespace-nowrap rounded-lg
                                            px-2 py-1 shadow-sm
                                            sm:px-3 sm:py-1.5

                                            ${isCurrent
                                                ? 'bg-primary-100 text-white shadow-lg ring-2 ring-white'
                                                : 'bg-white/90 backdrop-blur-[2px]'
                                            }
                                        `}
                                        /*
                                         * Posisi dalam PERSEN terhadap viewBox, bukan
                                         * piksel. Mobil sudah memakai cara ini
                                         * (x/800, y/900); penanda yang masih memakai
                                         * piksel akan meleset dari jalannya begitu
                                         * lebar kontainer bukan tepat 800px — yaitu
                                         * di hampir semua layar.
                                         */
                                        style={{
                                            left: `${(pos.left / road.width) * 100}%`,
                                            top: `${(pos.top / road.height) * 100}%`,
                                        }}
                                    >
                                        <div className={`font-heading text-small font-bold sm:text-body ${isCurrent ? 'text-white' : 'text-primary-100'}`}>
                                            {level.name}
                                        </div>

                                        {level.min > 0 && (
                                            <div className={`font-body text-micro font-bold ${isCurrent ? 'text-white/90' : 'text-secondary'}`}>
                                                {t('challenge.min_points', { points: level.min.toLocaleString('id-ID') })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Car Mascot — follows the SVG path */}
                            {pathReady && (
                                <CarOnPath
                                    x={carPos.x}
                                    y={carPos.y}
                                    road={road}
                                    totalPoints={totalPoints}
                                    isDriving={isDriving}
                                    labelVisible={labelVisible}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

// ─── Car component that positions itself based on SVG coordinates ─────────────
function CarOnPath({ x, y, road, totalPoints, isDriving, labelVisible }) {
    const { t } = useTranslation();
    // Koordinat SVG (viewBox 0 0 800 900) diubah jadi persen. Kontainernya
    // mengunci rasio 800:900, jadi persen ini selalu tepat di lebar layar mana
    // pun. Penanda level memakai perhitungan yang sama.
    const leftPercent = (x / road.width) * 100;
    const topPercent = (y / road.height) * 100;

    return (
        <div
            className="absolute flex flex-col items-center z-10 pointer-events-none"
            style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -100%)',
            }}
        >
            <div
                className={`mb-1 text-center bg-white/90 px-3 py-1 rounded-xl shadow-sm border border-gray-100 transition-all duration-500 ${labelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
                <div className="font-bold text-primary text-sm whitespace-nowrap">{t('challenge.your_position')}</div>
                <div className="text-[10px] text-secondary font-bold whitespace-nowrap">{t('challenge.points_nura', { points: totalPoints.toLocaleString('id-ID') })}</div>
            </div>
            <img
                src="/images/mascots/car.png"
                alt="Mascot Car"
                className={`w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg ${labelVisible ? 'car-arrived' : (isDriving ? 'car-driving' : '')}`}
            />
        </div>
    );
}

Levels.layout = (page) => <MainLayout pageTitle="title.levels" content={page}></MainLayout>
