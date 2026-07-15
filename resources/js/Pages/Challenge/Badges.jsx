import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';

export default function Badges({ generalBadges = [], specialBadges = [] }) {
    return (
        <>
            <Head title="Lencana Nuravers | NuraLoka" />
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-heading text-3xl font-bold text-primary">Lencana Nuravers</h1>
                        <p className="text-sm text-info font-medium mt-0.5 italic text-[#1B86FF]">Tandha Penggali Nuravers</p>
                        <div className="h-0.5 w-16 bg-[#1B86FF] mt-1 mb-6" />
                        
                        <Link href={route('challenge.index')} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-85 transition-colors font-medium text-sm">
                            <span className="mr-2">‹</span> Kembali ke Tantangan
                        </Link>
                    </div>

                    {/* Lencana Umum */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-primary mb-4">Lencana Umum</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b-2 border-gray-200">
                                    <tr>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Nama</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Deskripsi</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Progress Kamu</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Lencana</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generalBadges.map((cat, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-6 px-4 font-semibold text-gray-800 w-1/6 align-top pt-8">{cat.name}</td>
                                            <td className="py-6 px-4 text-gray-600 w-1/4 align-top pt-8 text-xs leading-relaxed">{cat.description}</td>
                                            <td className="py-6 px-4 w-1/5 align-top pt-8">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-gray-200">
                                                        <div 
                                                            className="absolute inset-0 rounded-full border-4 border-primary"
                                                            style={{
                                                                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`, // Just a visual placeholder, real circular progress would need SVG
                                                                opacity: cat.progress > 0 ? 1 : 0
                                                            }}
                                                        ></div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-primary">{cat.progress}%</div>
                                                            <div className="text-[9px] text-gray-500">{cat.progressCount}/{cat.progressTarget}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-primary font-medium mt-2">menuju {cat.nextTier.toLowerCase()}</div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 w-2/5">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {cat.tiers.map((tier, tIdx) => (
                                                        <div key={tIdx} className="flex flex-col items-center">
                                                            <div className="text-[10px] font-medium text-gray-600 mb-1 text-center h-6">{tier.name}<br/>{tier.target} {cat.name.split(' ')[2]}</div>
                                                            <div className={`w-14 h-14 rounded-full border-2 ${tier.earned ? 'border-primary' : 'border-gray-200'} bg-white p-1 mb-1 shadow-sm`}>
                                                                <img 
                                                                    src={`/${tier.icon_path}`} 
                                                                    alt={tier.name} 
                                                                    className={`w-full h-full object-contain ${tier.earned ? '' : 'grayscale opacity-50'}`}
                                                                />
                                                            </div>
                                                            <div className={`text-[10px] font-bold ${tier.earned ? 'text-secondary' : 'text-gray-400'}`}>{tier.points} Poin</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lencana Khusus */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4">Lencana Khusus</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b-2 border-gray-200">
                                    <tr>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Nama</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Deskripsi</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Cara Mendapatkan</th>
                                        <th className="py-3 px-4 font-bold text-primary text-center">Lencana</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {specialBadges.map((badge, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-6 px-4 font-semibold text-gray-800 w-1/5">{badge.name}</td>
                                            <td className="py-6 px-4 text-gray-600 w-1/3 text-xs leading-relaxed">{badge.description}</td>
                                            <td className="py-6 px-4 text-gray-600 w-1/4 text-xs leading-relaxed">{badge.how_to}</td>
                                            <td className="py-6 px-4 w-1/5">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-20 h-20 bg-white mb-2`}>
                                                        <img 
                                                            src={`/${badge.icon_path}`} 
                                                            alt={badge.name} 
                                                            className={`w-full h-full object-contain ${badge.earned ? 'drop-shadow-md' : 'grayscale opacity-50'}`}
                                                        />
                                                    </div>
                                                    <div className={`text-xs font-bold ${badge.earned ? 'text-secondary' : 'text-gray-400'}`}>{badge.points} Poin</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}

Badges.layout = (page) => <MainLayout pageTitle="Lencana" content={page}></MainLayout>
