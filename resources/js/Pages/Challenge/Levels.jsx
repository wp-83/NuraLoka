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
                                {/* Base path shadow */}
                                <path d="M 120 80 Q 200 40, 300 120 T 500 150 T 650 250 T 600 400 T 300 350 T 200 550 T 400 650 T 650 600 T 700 800" stroke="#000000" strokeOpacity="0.1" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                                
                                {/* Completed path (Brown) */}
                                <path d="M 120 80 Q 200 40, 300 120 T 500 150 T 650 250" stroke="#724633" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Dashed center line for completed */}
                                <path d="M 120 80 Q 200 40, 300 120 T 500 150 T 650 250" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12" />
                                
                                {/* Incomplete path (Gray) */}
                                <path d="M 650 250 T 600 400 T 300 350 T 200 550 T 400 650 T 650 600 T 700 800" stroke="#B3B3B3" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Dashed center line for incomplete */}
                                <path d="M 650 250 T 600 400 T 300 350 T 200 550 T 400 650 T 650 600 T 700 800" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12" />
                            </svg>

                            {/* Level Markers */}
                            <div className="absolute top-[40px] left-[50px]">
                                <span className="font-medium text-primary text-lg">Pemula</span>
                            </div>

                            <div className="absolute top-[210px] left-[580px] bg-white bg-opacity-80 px-2 py-1 rounded">
                                <div className="font-medium text-primary text-lg">Penjelajah Muda</div>
                                <div className="text-xs text-secondary font-bold">≥ 1.000 Poin Nura</div>
                            </div>

                            <div className="absolute top-[380px] left-[400px] bg-white bg-opacity-80 px-2 py-1 rounded">
                                <div className="font-medium text-primary text-lg">Petualang</div>
                                <div className="text-xs text-secondary font-bold">≥ 2.000 Poin Nura</div>
                            </div>

                            <div className="absolute top-[470px] left-[150px] bg-white bg-opacity-80 px-2 py-1 rounded">
                                <div className="font-medium text-primary text-lg">Eksplorer Nusantara</div>
                                <div className="text-xs text-secondary font-bold">≥ 6.000 Poin Nura</div>
                            </div>

                            <div className="absolute top-[580px] left-[350px] bg-white bg-opacity-80 px-2 py-1 rounded">
                                <div className="font-medium text-primary text-lg">Master Eksplorer</div>
                                <div className="text-xs text-secondary font-bold">≥ 10.000 Poin Nura</div>
                            </div>

                            <div className="absolute top-[670px] left-[550px] bg-white bg-opacity-80 px-2 py-1 rounded">
                                <div className="font-medium text-primary text-lg">Legenda Nuravers</div>
                                <div className="text-xs text-secondary font-bold">≥ 15.000 Poin Nura</div>
                            </div>

                            {/* Current Position Mascot */}
                            <div className="absolute top-[50px] left-[260px] flex flex-col items-center">
                                <div className="mb-1 text-center">
                                    <div className="font-bold text-primary text-sm">Posisi Kamu</div>
                                    <div className="text-[10px] text-secondary font-bold">{totalPoints.toLocaleString('id-ID')} Poin Nura</div>
                                </div>
                                <img src="/images/mascots/car.png" alt="Mascot Car" className="w-24 h-24 object-contain drop-shadow-lg" />
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

Levels.layout = (page) => <MainLayout pageTitle="Level" content={page}></MainLayout>
