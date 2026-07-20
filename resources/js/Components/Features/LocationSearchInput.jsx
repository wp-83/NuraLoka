import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMapPin, FiLoader } from 'react-icons/fi';
import Input from '@components/Forms/Input';

export default function LocationSearchInput({ placeholder, onSelectLocation }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Debounced search to Nominatim
    useEffect(() => {
        if (!query || query.trim() === '') {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                // Batasi pencarian ke Indonesia (countrycodes=id) agar relevan
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("OSM Nominatim Error:", err);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative mb-3 w-full" ref={wrapperRef}>
            <Input
                type="search"
                name="locationSearch"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                icon={<FiSearch size={20} />}
                iconRight={loading ? <FiLoader className="animate-spin text-amber-600" size={14} /> : null}
            />
            
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[600] overflow-y-auto max-h-56">
                    {suggestions.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                setQuery(item.display_name.split(',')[0]); // Isi input dengan nama pendek
                                setIsOpen(false);
                                onSelectLocation({
                                    name: item.display_name.split(',')[0],
                                    address: item.display_name,
                                    lat: parseFloat(item.lat),
                                    lng: parseFloat(item.lon)
                                });
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors"
                        >
                            <FiMapPin className="text-gray-400 flex-shrink-0" size={14} />
                            <div className="min-w-0 text-left">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                    {item.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {item.display_name.substring(item.display_name.indexOf(',') + 1).trim()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
