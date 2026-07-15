import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';

export default function Levels({ totalPoints = 0, currentLevel = {}, allLevels = [] }) {
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
                                    <path id="mainPath" d="M 120 80 Q 200 40, 300 120 T 500 150 T 650 250 T 600 400 T 300 350 T 200 550 T 400 650 T 650 600 T 700 800" />
                                    {(() => {
                                        // Calculate total progress across the whole 5-segment path
                                        const currentIdx = allLevels.findIndex(l => l.name === currentLevel.name) || 0;
                                        const nextIdx = currentIdx < allLevels.length - 1 ? currentIdx + 1 : currentIdx;
                                        const min = allLevels[currentIdx]?.min || 0;
                                        const max = allLevels[nextIdx]?.min || min;
                                        let percent = 0;
                                        if (max > min) {
                                            percent = Math.min(1, Math.max(0, (totalPoints - min) / (max - min)));
                                        }
                                        const globalPercent = Math.min(1, (currentIdx + percent) / (allLevels.length - 1 || 1));
                                        
                                        // Path length is roughly 2500 for this specific SVG path
                                        // We use strokeDasharray to fill it up to the percentage
                                        const pathLength = 2600; 
                                        const fillLength = pathLength * globalPercent;
                                        
                                        return (
                                            <style>
                                                {`
                                                .path-bg { stroke: #B3B3B3; }
                                                .path-fill { stroke: #724633; stroke-dasharray: ${pathLength}; stroke-dashoffset: ${pathLength - fillLength}; transition: stroke-dashoffset 1s ease-in-out; }
                                                .path-dash-bg { stroke: white; stroke-dasharray: 12 12; }
                                                .path-dash-fill { stroke: white; stroke-dasharray: 12 12 ${pathLength}; stroke-dashoffset: 0; }
                                                `}
                                            </style>
                                        );
                                    })()}
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
                                const positions = [
                                    { top: 40, left: 50 },
                                    { top: 210, left: 580 },
                                    { top: 380, left: 400 },
                                    { top: 470, left: 150 },
                                    { top: 580, left: 350 },
                                    { top: 670, left: 550 },
                                ];
                                const pos = positions[idx] || positions[0];
                                
                                return (
                                    <div key={idx} className="absolute bg-white bg-opacity-80 px-2 py-1 rounded" style={{ top: pos.top + 'px', left: pos.left + 'px' }}>
                                        <div className="font-medium text-primary text-lg">{level.name}</div>
                                        {level.min > 0 && <div className="text-xs text-secondary font-bold">≥ {level.min.toLocaleString('id-ID')} Poin Nura</div>}
                                    </div>
                                );
                            })}

                            {/* Current Position Mascot */}
                            {(() => {
                                const currentIdx = allLevels.findIndex(l => l.name === currentLevel.name);
                                const nextIdx = currentIdx < allLevels.length - 1 ? currentIdx + 1 : currentIdx;
                                
                                const positions = [
                                    { top: 40, left: 50 },
                                    { top: 210, left: 580 },
                                    { top: 380, left: 400 },
                                    { top: 470, left: 150 },
                                    { top: 580, left: 350 },
                                    { top: 670, left: 550 },
                                ];
                                
                                const p1 = positions[currentIdx] || positions[0];
                                const p2 = positions[nextIdx] || positions[0];
                                
                                const min = allLevels[currentIdx]?.min || 0;
                                const max = allLevels[nextIdx]?.min || min;
                                
                                let percent = 0;
                                if (max > min) {
                                    percent = Math.min(1, Math.max(0, (totalPoints - min) / (max - min)));
                                }
                                
                                // Interpolate position along straight line between the level markers for the mascot
                                // (A more accurate approach would use getPointAtLength on the SVG path, but this is acceptable for the mascot)
                                const carTop = p1.top + (p2.top - p1.top) * percent;
                                const carLeft = p1.left + (p2.left - p1.left) * percent;
                                
                                return (
                                    <div className="absolute flex flex-col items-center z-10 transition-all duration-1000" style={{ top: (carTop - 20) + 'px', left: (carLeft + 80) + 'px' }}>
                                        <div className="mb-1 text-center bg-white/90 px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                                            <div className="font-bold text-primary text-sm">Posisi Kamu</div>
                                            <div className="text-[10px] text-secondary font-bold">{totalPoints.toLocaleString('id-ID')} Poin Nura</div>
                                        </div>
                                        <img src="/images/mascots/car.png" alt="Mascot Car" className="w-24 h-24 object-contain drop-shadow-lg" />
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

Levels.layout = (page) => <MainLayout pageTitle="Level" content={page}></MainLayout>
