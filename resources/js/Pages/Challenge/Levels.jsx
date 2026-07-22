import { Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import RegionalGreeting from '@js/Daerah/RegionalGreeting';
import Button from '@components/Forms/Button';
import { useTranslation } from '@js/i18n';
import { IoChevronBackSharp } from 'react-icons/io5';

/**
 * The road shape, in two aspect ratios.
 *
 * One path is not enough: forced onto a phone screen, the wide 800x900 shape is
 * only about 386px tall — the road shrinks and the level markers crowd together.
 * The phone version is narrow and tall so it uses the vertical space that screen
 * actually has.
 *
 * Both use cubic Béziers with COLLINEAR control points at every join, so the
 * curves flow without a visible kink.
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
    // Goes true once and never back to false — the signal that the coloured line
    // may fill. Unlike isDriving, which returns to false when the animation ends
    // and would therefore shrink the line back to zero.
    const [progressStarted, setProgressStarted] = useState(false);
    const [pathReady, setPathReady] = useState(false);

    // Pick the road shape from the screen width. This uses matchMedia rather than
    // Tailwind classes alone, because the viewBox and the percentage divisors
    // change with it too.
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

        // Start the coloured line at the same moment the car sets off. Without
        // this the line begins as soon as the path is measured, 400 ms before the
        // car leaves, and the two never line up.
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

    // Level marker positions are COMPUTED from the same SVG path the car drives,
    // using the same distance division as globalPercent above — so a marker
    // always sits exactly where the car stops.
    const [positions, setPositions] = useState([]);

    // The REAL path length, measured from the SVG element. The coloured line and
    // the car must use one and the same length, or the end of the line never
    // coincides with the car.
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
        // 'road' is a dependency too: when the shape changes (on rotation, say)
        // the length and the positions must be recomputed.
    }, [pathReady, allLevels, road]);

    // The coloured line uses the car's length, so it ends exactly at the car.
    // Before measurement it uses 1, so dasharray and offset cancel out and the
    // line is hidden rather than flashing at full length.
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
                            // The ratio follows the road's current viewBox, so
                            // the SVG fills its box with no empty space and the
                            // markers' percentage positions stay accurate.
                            style={{ aspectRatio: `${road.width} / ${road.height}` }}
                        >
                            {/* Winding road SVG */}
                            {/* drop-shadow-md removed: the shadow now comes from
                                the roadShadow filter, which applies to the road
                                body alone rather than the whole SVG. */}
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
                                        // The key forces a remount when the road
                                        // shape changes, so getTotalLength()
                                        // measures the new path.
                                        key={road.width}
                                        ref={pathRef}
                                        id="mainPath"
                                        d={road.d}
                                    />
                                    {/* A soft shadow under the road body. */}
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
                                            /* Must match the car animation:
                                               2500 ms, ease-out cubic (see
                                               animateCar). A different curve
                                               separates the line from the car
                                               mid-animation even though they
                                               finish together. */
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

                                {/* The road is layered outside in so it reads as a
                                    real road:

                                      shoulder -> edge line -> asphalt -> centre line

                                    The edge lines come from stacking slightly
                                    narrower asphalt over a white layer, leaving a
                                    thin white line on each side — SVG cannot draw
                                    parallel lines from a single path. */}

                                {/* Shoulder (dirt/gravel) plus its shadow */}
                                <use
                                    href="#mainPath"
                                    stroke="#FFF0E8"
                                    strokeWidth="40"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#roadShadow)"
                                />

                                {/* The edge-line layer */}
                                <use href="#mainPath" stroke="#F3F4F2" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Asphalt not yet travelled */}
                                <use href="#mainPath" className="path-bg" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Asphalt already travelled */}
                                <use href="#mainPath" className="path-fill" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Dashed centre line */}
                                <use href="#mainPath" className="path-dash-bg" strokeWidth="3" strokeLinecap="butt" strokeLinejoin="round" />
                            </svg>

                            {/* Level Markers */}
                            {allLevels.map((level, idx) => {
                                const pos = positions[idx];

                                // Wait for the path; without this the markers
                                // briefly pile up in the corner before their
                                // positions are computed.
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
                                         * Positioned in PERCENT of the viewBox, not
                                         * in pixels. The car already works this way
                                         * (x/800, y/900); a marker still using pixels
                                         * drifts off the road as soon as the
                                         * container is not exactly 800px wide — which
                                         * is nearly every screen.
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
    // SVG coordinates (viewBox 0 0 800 900) converted to percentages. The
    // container locks the 800:900 ratio, so these stay accurate at any width.
    // The level markers use the same calculation.
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
