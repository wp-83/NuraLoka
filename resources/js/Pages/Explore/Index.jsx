import React, { useState, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import ExploreMap from '@components/ExploreMap';

export default function Index() {
    const { places, filters: initialFilters } = usePage().props;
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || '');
    const [sort, setSort] = useState(initialFilters?.sort || 'newest');

  // Extract unique categories from places data
  const categories = useMemo(() => {
    const uniqueCategories = {};
    places?.forEach(place => {
      place.categories?.forEach(category => {
        if (!uniqueCategories[category.id]) {
          uniqueCategories[category.id] = category;
        }
      });
    });
    return Object.values(uniqueCategories);
  }, [places]);

  // Handle filter changes - send to backend
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    applyFilters({ search: searchQuery, category: selectedCategory, sort });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    applyFilters({ search: '', category: selectedCategory, sort });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    applyFilters({ search: searchQuery, category: value, sort });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSort(value);
    applyFilters({ search: searchQuery, category: selectedCategory, sort: value });
  };

  const applyFilters = (filters) => {
    router.get(route('places.index'), {
      search: filters.search || undefined,
      category: filters.category || undefined,
      sort: filters.sort || undefined,
    }, {
      preserveScroll: true,
      preserveState: false
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3EDE9' }}>
      
      {/* 1. Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b-4" style={{ borderColor: '#D5B9AA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-4">
            <button className="px-7 py-3 border-3 font-semibold rounded-lg transition-all duration-200" style={{ borderColor: '#5A3812', color: '#5A3812' }}>
              Trip
            </button>
            <button className="px-7 py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200" style={{ backgroundColor: '#5A3812' }}>
              Destination
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main>

        {/* 2. Hero / Landing Section */}
        <header className="relative py-24 sm:py-32 lg:py-40 overflow-hidden rounded-b-3xl shadow-xl" style={{ backgroundColor: '#F9F7F5' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: '#239A90' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent" style={{ pointerEvents: 'none' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-10">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight" style={{ color: '#5A3812' }}>
                <span className="block">Explore</span>
                <span className="block" style={{ color: '#239A90' }}>Beyond</span>
              </h1>
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-body" style={{ color: '#4D4D4D' }}>
                Discover curated journeys tailored for nomads, backpackers, and solo travelers seeking unforgettable experiences.
              </p>
            </div>
          </div>
        </header>

        {/* Spacing Section */}
        <div style={{ height: '48px' }}></div>

        {/* 3. Search & Filter Section */}
        <section className="max-w mx-4 p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-12  border border-white/50" style={{ borderTop: '8px solid #239A90', boxShadow: '0 20px 40px rgba(90, 56, 18, 0.1)' }}>
            <div className="space-y-2 w-full">
              <h2 className="text-4xl sm:text-5xl font-black text-center" style={{ color: '#5A3812' }}>
                Find Your Next Adventure
              </h2>
              <p className="text-center text-base font-body" style={{ color: '#808080' }}>
                Search, filter, and discover amazing destinations
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-stretch sm:items-center w-full">
              {/* Search Input */}
              <div className="flex-1 sm:flex-none mx-9">
                <div className="flex items-center bg-white border-3 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg" style={{ borderColor: '#D5B9AA' }}>
                  <input 
                    type="text" 
                    placeholder="Search destinations..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="flex-1 px-5 py-4 outline-none bg-transparent text-lg font-body"
                    style={{ color: '#000000' }}
                  />
                  {searchQuery ? (
                    <button 
                      type="button"
                      className="pr-4 py-4 transition-all hover:opacity-70 flex-shrink-0"
                      onClick={handleClearSearch}
                      title="Cancel search"
                      style={{ color: '#808080' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      type="button"
                      className="px-5 py-4 transition-all hover:opacity-80 flex-shrink-0"
                      onClick={handleSearchSubmit}
                      title="Search"
                      style={{ color: '#239A90' }}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 2a8 8 0 016.32 12.905l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <select 
                value={selectedCategory || ''} 
                onChange={handleCategoryChange}
                className="px-6 py-4 border-3 rounded-2xl outline-none font-semibold text-base transition-all duration-200 hover:shadow-md"
                style={{ borderColor: '#D5B9AA', color: '#5A3812', backgroundColor: '#FFFFFF' }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select 
                value={sort} 
                onChange={handleSortChange}
                className="px-6 py-4 border-3 rounded-2xl outline-none font-semibold text-base transition-all duration-200 hover:shadow-md"
                style={{ borderColor: '#D5B9AA', color: '#5A3812', backgroundColor: '#FFFFFF' }}
              >
                <option value="newest">Sort By</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <div style={{ height: '64px' }}></div>

        {/* 4. Map & Destination Layout (12-Column Grid) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Destination List OR Detail View (5 cols on desktop, full on mobile) */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-4 shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '700px', border: '1px solid #F0F0F0' }}>
              
              {/* If a place is selected, show Detail View */}
              {selectedPlace ? (
                <div className="p-10 sm:p-14 flex flex-col h-full overflow-y-auto space-y-10">
                  <div className="flex justify-between items-center gap-4 pb-6 border-b-2" style={{ borderColor: '#E6E6E6' }}>
                    <button 
                      className="p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                      onClick={() => setSelectedPlace(null)}
                      title="Go back"
                      style={{ backgroundColor: '#F3EDE9', color: '#5A3812' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg font-bold transition-all duration-200 text-lg hover:bg-gray-100"
                      onClick={() => setSelectedPlace(null)}
                      style={{ backgroundColor: '#F3EDE9', color: '#5A3812' }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-5xl font-black leading-tight" style={{ color: '#5A3812' }}>{selectedPlace.name}</h3>
                    <div className="flex items-start gap-4 p-6 rounded-2xl border-2" style={{ backgroundColor: '#F8FFFE', borderColor: '#E0F2F1' }}>
                      <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#239A90' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-base font-body leading-relaxed" style={{ color: '#4D4D4D' }}>{selectedPlace.address}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-2xl border-3 space-y-4" style={{ backgroundColor: '#E9F7F6', borderColor: '#239A90' }}>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#239A90' }}>📍 Coordinates</p>
                    <p className="text-sm font-body font-semibold" style={{ color: '#000000' }}>
                      <span>Lat: {parseFloat(selectedPlace.latitude).toFixed(6)}</span>
                      <span className="mx-3" style={{ color: '#808080' }}>•</span>
                      <span>Lng: {parseFloat(selectedPlace.longitude).toFixed(6)}</span>
                    </p>
                  </div>
                  
                  <p className="text-base font-body flex-1 leading-relaxed" style={{ color: '#4D4D4D' }}>{selectedPlace.description}</p>
                  
                  <button className="w-full px-6 py-6 text-white font-black rounded-2xl hover:shadow-xl transition-all duration-200 text-lg" style={{ backgroundColor: '#239A90' }}>
                    Plan Trip Here
                  </button>
                </div>
              ) : (
                /* List View */
                <div className="p-10 sm:p-14 flex flex-col h-full space-y-8">
                  <div className="flex justify-between items-center gap-4 pb-6 ">
                    <h3 className="text-4xl font-black" style={{ color: '#5A3812' }}>Destinations</h3>
                    <span className="px-5 py-2 rounded-full text-sm font-black text-white" style={{ backgroundColor: '#239A90' }}>{places?.length} places</span>
                  </div>
                  <hr className='border-2 border-primary-100 my-2'/>
                  <div className="flex-1 overflow-y-auto space-y-5 px-2 py-2 -mx-2 gap-5">
                    {places?.length > 0 ? (
                      places.map(place => (
                        <div 
                          key={place.id} 
                          className="p-7 gap-4 border-2 rounded-2xl my-2 p-2 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:border-teal-300"
                          style={{ borderColor: '#E6E6E6', backgroundColor: '#FAFAFA' }}
                          onClick={() => setSelectedPlace(place)}
                        >
                          <h4 className="font-black text-base line-clamp-1 group-hover:text-lg transition-all" style={{ color: '#5A3812' }}>{place.name}</h4>
                          <p className="text-sm font-body line-clamp-1 mt-3" style={{ color: '#808080' }}>{place.address}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48">
                        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#D5B9AA' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-center text-sm font-body" style={{ color: '#808080' }}>No destinations found.<br/>Try adjusting your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Map Component (7 cols on desktop, full on mobile) */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl shadow-lg overflow-hidden" style={{ height: '700px', position: 'relative', zIndex: 0, border: '1px solid #F0F0F0' }}>
              <ExploreMap places={places || []} selectedPlace={selectedPlace} />
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}