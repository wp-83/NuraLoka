import React from 'react';
import { FiMapPin, FiBookmark, FiUsers, FiCamera } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { useTranslation } from '@js/i18n';

export default function PlaceCard({ place, onVisit, isSaved = false, onToggleSave }) {
    const { t } = useTranslation();
    return (
        <div
            onClick={() => onVisit(place)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer relative"
        >
            <div className="relative h-44 bg-gray-200 overflow-hidden">
                {place.img ? (
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <FiMapPin size={32} className="text-gray-400" />
                    </div>
                )}
            </div>
            <div className="p-4 relative z-10">
                <div className="flex justify-between items-start gap-2 mb-0.5 w-full overflow-hidden">
                    <h3 className="font-bold text-gray-900 text-base truncate flex-grow min-w-0" style={{ fontFamily: 'Poppins, sans-serif' }}>{place.name}</h3>
                    <button
                        type="button"
                        className={`flex-shrink-0 transition-colors relative z-50 flex items-center justify-center ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-gray-900 hover:text-amber-600'}`}
                        style={{ width: '22px', height: '22px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleSave) onToggleSave(place);
                        }}
                    >
                        {isSaved ? (
                            <FaBookmark size={20} style={{ minWidth: '20px', minHeight: '20px' }} />
                        ) : (
                            <FiBookmark size={22} style={{ minWidth: '22px', minHeight: '22px' }} />
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{place.address}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {place.categories && place.categories.map((cat) => (
                        <span key={cat.id} className="bg-amber-600 text-white px-3 py-1 rounded-full flex items-center gap-1 font-semibold" style={{ fontSize: '0.68rem' }}>
                            🏛 {cat.name}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {Number(place.visitors_count) > 0 && (
                        <span className="flex items-center gap-1">
                            <FiUsers size={13} className="text-accent" />
                            {t('explore.card_visitors', { count: Number(place.visitors_count).toLocaleString('id-ID') })}
                        </span>
                    )}
                    {Number(place.album_posters_count) > 0 && (
                        <span className="flex items-center gap-1">
                            <FiCamera size={13} className="text-accent" />
                            {t('explore.card_albums', { count: Number(place.album_posters_count).toLocaleString('id-ID') })}
                        </span>
                    )}
                    {!(Number(place.visitors_count) > 0) && !(Number(place.album_posters_count) > 0) && (
                        <span>{t('explore.card_popular_saved')}</span>
                    )}
                </div>
            </div>

            {/* Background Mascot Overlay */}
            <div className="absolute -bottom-10 right-0 w-32 h-32 opacity-60 pointer-events-none z-0 transition-all duration-500 group-hover:-rotate-[-13.69deg] group-hover:opacity-100">
                <img src="/images/mascots/camera.png" alt="mascot-bg" className="w-full h-full object-contain" />
            </div>
        </div>
    );
}
