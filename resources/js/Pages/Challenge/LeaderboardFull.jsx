import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import MainLayout from '@js/Layouts/MainLayout';
import { FiSearch, FiX } from 'react-icons/fi';

export default function LeaderboardFull({ leaderboard = [], search = '', totalResults = null }) {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('challenge.leaderboard'), { search: searchTerm }, { preserveState: true });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('challenge.leaderboard'));
    };

    return (
        <>
            <Head title="Papan Peringkat | NuraLoka" />
            <div className="w-full min-h-screen bg-[#FAF8F4]">
                <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-3xl font-bold text-primary">Papan Peringkat Para Nuravers</h1>
                        <p className="text-sm text-info font-medium mt-0.5 italic text-[#1B86FF]">Papan Undhakan Para Nuraver</p>
                        <div className="h-0.5 w-16 bg-[#1B86FF] mt-1 mb-6" />
                        
                        <div className="flex justify-between items-end">
                            <Link href={route('challenge.index')} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-85 transition-colors font-medium text-sm">
                                <span className="mr-2">‹</span> Kembali ke Tantangan
                            </Link>

                            {totalResults !== null && (
                                <div className="text-sm text-gray-500 italic">Ditemukan {totalResults} pengguna</div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-10 py-3 bg-[#FEF0E6] border-none rounded-xl text-sm placeholder-gray-500 focus:ring-0 focus:outline-none"
                                placeholder="Temukan namamu ataupun nama orang lain di papan peringkat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <FiX className="text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-3">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((user) => {
                                // Background based on rank or if current user in search
                                let bgClass = "bg-[#EEF5F0]";
                                let rowBorder = "";
                                if (search && user.is_current) {
                                    bgClass = "bg-[#FFF8F3] border-[#FDBA74]";
                                    rowBorder = "border";
                                } else if (!search) {
                                    if (user.rank === 1) bgClass = "bg-gradient-to-r from-[#FDE68A] to-[#FEF3C7] border-[#FCD34D] border";
                                    else if (user.rank === 2) bgClass = "bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6] border-[#D1D5DB] border";
                                    else if (user.rank === 3) bgClass = "bg-gradient-to-r from-[#FFEDD5] to-[#FFF7ED] border-[#FDBA74] border";
                                }

                                return (
                                    <Link
                                        key={user.rank}
                                        href={route('profile.show', { username: user.username })}
                                        className={`flex items-center p-4 rounded-xl ${bgClass} ${rowBorder} transition-colors relative overflow-hidden shadow-sm ${!rowBorder ? 'border border-black/5' : ''} cursor-pointer hover:shadow-md`}
                                    >
                                        
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-amber-100 mr-4 border border-white/50">
                                            {user.profile_path ? (
                                                <img src={user.profile_path} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-amber-800 uppercase text-lg">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="font-bold text-primary text-base">
                                                {user.name} {user.is_current ? <span className="text-secondary">(Kamu)</span> : ''}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                                                <span className="text-secondary font-bold">{user.level}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 font-medium">{user.points.toLocaleString('id-ID')} Poin</span>
                                            </div>
                                        </div>

                                        {/* Badges Preview */}
                                        <div className="hidden sm:flex items-center mr-6">
                                            <div className="flex -space-x-2">
                                                {user.badge_icons.map((icon, idx) => (
                                                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-amber-50 shadow-sm overflow-hidden flex items-center justify-center relative z-10">
                                                        <img src={`/${icon}`} alt="badge" className="w-[85%] h-[85%] object-contain" />
                                                    </div>
                                                ))}
                                                {user.badge_count > 5 && (
                                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center relative z-20 text-xs font-bold text-gray-500">
                                                        {user.badge_count}+
                                                    </div>
                                                )}
                                                {user.badge_count <= 5 && user.badge_count > 0 && (
                                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center relative z-20 text-xs font-bold text-gray-500">
                                                        {user.badge_count}+
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rank */}
                                        <div className="text-2xl font-black text-primary min-w-[3rem] text-right">
                                            #{user.rank}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                {search ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada data peringkat.'}
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}

LeaderboardFull.layout = (page) => <MainLayout pageTitle="Leaderboard" content={page}></MainLayout>
