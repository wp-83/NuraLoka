import React from 'react';
import { FiMapPin, FiBookmark, FiUsers, FiCamera } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import CategoryChip from '@components/Features/CategoryChip';
import { useTranslation } from '@js/i18n';

export default function PlaceCard({ place, onVisit, isSaved = false, onToggleSave }) {
    const { t } = useTranslation();

    return (
        <div
            onClick={() => onVisit(place)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer relative"
        >
            {/* Bidang foto — SELALU terisi penuh, termasuk saat memakai gambar
                bawaan. /images/defaults/image.png memang placeholder selebar
                bidang (570×321), jadi diperlakukan sama seperti foto asli:
                object-cover, bukan ikon kecil di tengah. */}
            <div className="relative h-44 bg-gray-10 overflow-hidden">
                <img
                    src={place.img || '/images/defaults/image.png'}
                    alt={place.img ? place.name : ''}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    // Foto bisa saja terhapus dari storage — jangan sampai
                    // kartunya menampilkan ikon gambar rusak.
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/defaults/image.png';
                    }}
                />
            </div>
            <div className="p-4 relative z-10">
                <div className="flex justify-between items-start gap-2 w-full overflow-hidden">
                    <h3 className="text-primary truncate flex-grow min-w-0 text-paragraph" style={{ fontFamily: 'Poppins, sans-serif' }}>{place.name}</h3>
                    <button
                        type="button"
                        className={`flex-shrink-0 transition-colors relative z-50 flex items-center justify-center ${isSaved ? 'text-accent hover:text-accent-70' : 'text-primary hover:text-secondary'}`}
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
                <p className="text-gray-100 mb-3 text-small truncate">{place.address}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {place.categories && place.categories.map((cat) => (
                        <CategoryChip key={cat.id} category={cat} size="sm" />
                    ))}
                </div>
                <div className="flex items-center gap-3 mt-5 text-small text-gray">
                    {Number(place.visitors_count) > 0 && (
                        <span className="flex items-center gap-1">
                            <FiUsers size={16} className="text-accent" />
                            {t('explore.card_visitors', { count: Number(place.visitors_count).toLocaleString('id-ID') })}
                        </span>
                    )}
                    {Number(place.album_posters_count) > 0 && (
                        <span className="flex items-center gap-1">
                            <FiCamera size={16} className="text-accent" />
                            {t('explore.card_albums', { count: Number(place.album_posters_count).toLocaleString('id-ID') })}
                        </span>
                    )}
                    {!(Number(place.visitors_count) > 0) && !(Number(place.album_posters_count) > 0) && (
                        <span>{t('explore.card_popular_saved')}</span>
                    )}
                </div>
            </div>

            {/* Background Mascot Overlay */}
            <div className="absolute -bottom-10 right-0 w-28 h-28 opacity-60 pointer-events-none z-0 transition-all duration-500 group-hover:-rotate-[-13.69deg] group-hover:opacity-100">
                <img src="/images/mascots/camera.png" alt="mascot-bg" className="w-full h-full object-contain" />
            </div>
        </div>
    );
}
