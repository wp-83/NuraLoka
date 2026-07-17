import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';

export default function Levels({ totalPoints = 0, currentLevel = {}, allLevels = [] }) {
    const pathRef = useRef(null);
    const [carPos, setCarPos] = useState({ x: 0, y: 0 });
    const [labelVisible, setLabelVisible] = useState(false);
    const [isDriving, setIsDriving] = useState(false);
    const [pathReady, setPathReady] = useState(false);

    // Calculate target percentage along the path
    const currentIdx = allLevels.findIndex(l => l.name === currentLevel.name) || 0;
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

    // Level marker positions (matching SVG viewBox coordinates)
    const positions = [
        { top: 40, left: 50 },
        { top: 210, left: 580 },
        { top: 380, left: 400 },
        { top: 470, left: 150 },
        { top: 580, left: 350 },
        { top: 670, left: 550 },
    ];

    // Path fill animation
    const pathLength = 2600;
    const fillLength = pathLength * globalPercent;

    return (
        <>
            <Head title="Perjalanan Level Kamu | NuraLoka" />
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 relative">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-heading text-3xl font-bold text-primary">Perjalanan Level Kamu</h1>
                        <p className="text-sm text-info font-medium mt-0.5 italic text-[#1B86FF]">Lelampahan Tingkat Panjenengan</p>
                        <div className="h-0.5 w-16 bg-[#1B86FF] mt-1 mb-6" />

                        <Link href={route('challenge.index')} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-85 transition-colors font-medium text-sm">
                            <span className="mr-2">‹</span> Kembali ke Tantangan
                        </Link>
                    </div>

                    {/* Winding Road Visualization */}
                    <div className="relative w-full overflow-visible py-10 my-10 flex justify-center">
                        <div className="relative w-full max-w-[800px] h-[900px]">
                            {/* Winding road SVG */}
                            <svg width="100%" height="100%" viewBox="0 0 800 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full drop-shadow-md">
                                <defs>
                                    <path
                                        ref={pathRef}
                                        id="mainPath"
                                        d="M 120 80 Q 200 40, 300 120 T 500 150 T 650 250 T 600 400 T 300 350 T 200 550 T 400 650 T 650 600 T 700 800"
                                    />
                                    <style>
                                        {`
                                        .path-bg { stroke: #B3B3B3; }
                                        .path-fill {
                                            stroke: #724633;
                                            stroke-dasharray: ${pathLength};
                                            stroke-dashoffset: ${pathLength - fillLength};
                                            transition: stroke-dashoffset 2.5s cubic-bezier(0.22, 1, 0.36, 1);
                                        }
                                        .path-dash-bg { stroke: white; stroke-dasharray: 12 12; }

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

                                {/* Base path shadow */}
                                <use href="#mainPath" stroke="#000000" strokeOpacity="0.1" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Incomplete path (Gray) */}
                                <use href="#mainPath" className="path-bg" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Completed path (Brown) */}
                                <use href="#mainPath" className="path-fill" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Dashed center line */}
                                <use href="#mainPath" className="path-dash-bg" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            {/* Level Markers */}
                            {allLevels.map((level, idx) => {
                                const pos = positions[idx] || positions[0];

                                return (
                                    <div key={idx} className="absolute bg-white bg-opacity-80 px-2 py-1 rounded" style={{ top: pos.top + 'px', left: pos.left + 'px' }}>
                                        <div className="font-medium text-primary text-lg">{level.name}</div>
                                        {level.min > 0 && <div className="text-xs text-secondary font-bold">≥ {level.min.toLocaleString('id-ID')} Poin Nura</div>}
                                    </div>
                                );
                            })}

                            {/* Car Mascot — follows the SVG path */}
                            {pathReady && (
                                <CarOnPath
                                    x={carPos.x}
                                    y={carPos.y}
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
function CarOnPath({ x, y, totalPoints, isDriving, labelVisible }) {
    // The SVG viewBox is 0 0 800 900, and the container is max-w-[800px] h-[900px]
    // We need to convert SVG coordinates to percentage positions
    const leftPercent = (x / 800) * 100;
    const topPercent = (y / 900) * 100;

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
                <div className="font-bold text-primary text-sm whitespace-nowrap">Posisi Kamu</div>
                <div className="text-[10px] text-secondary font-bold whitespace-nowrap">{totalPoints.toLocaleString('id-ID')} Poin Nura</div>
            </div>
            <img
                src="/images/mascots/car.png"
                alt="Mascot Car"
                className={`w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg ${labelVisible ? 'car-arrived' : (isDriving ? 'car-driving' : '')}`}
            />
        </div>
    );
}

Levels.layout = (page) => <MainLayout pageTitle="Level" content={page}></MainLayout>
