import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Function to create custom marker icon
const createMarkerIcon = (iconPath) => {
  if (!iconPath) {
    return L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  return L.icon({
    iconUrl: iconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map centering when selected place changes or route is drawn
const MapUpdater = ({ selectedPlace, routeData }) => {
  const map = useMap();
  React.useEffect(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      map.fitBounds(routeData.coordinates, { padding: [50, 50], animate: true, duration: 1.5 });
    } else if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, { duration: 1.5 });
    }
  }, [selectedPlace, routeData, map]);
  return null;
};

// BoundsWatcher — fires onBoundsChange when user pans or zooms the map, and on mount
const BoundsWatcher = ({ onBoundsChange, onZoomChange, onSettle }) => {
  const map = useMapEvents({
    moveend: () => {
      // Peta selesai bergerak (termasuk setelah flyTo ke titik terpilih).
      if (onSettle) onSettle();
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast(),
          zoom: map.getZoom(),
        });
      }
    },
    zoomend: () => {
      if (onZoomChange) onZoomChange(map.getZoom());
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast(),
          zoom: map.getZoom(),
        });
      }
    },
  });

  React.useEffect(() => {
    if (map) {
      if (onZoomChange) onZoomChange(map.getZoom());
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast(),
          zoom: map.getZoom(),
        });
      }
    }
  }, [map, onBoundsChange, onZoomChange]);

  return null;
};

// Color palette for OSM category circle markers
const OSM_COLORS = {
  'Kuliner':        '#f59e0b',
  'Museum':         '#8b5cf6',
  'Pantai':         '#06b6d4',
  'Air Terjun':     '#3b82f6',
  'Wisata Alam':    '#22c55e',
  'Taman Hiburan':  '#f97316',
  'Wisata Budaya':  '#a855f7',
  'Religi':         '#ec4899',
  'Belanja':        '#14b8a6',
  'Lainnya':        '#64748b',
};

// Marker satuan untuk satu place lokal (dipakai saat titik tidak terklaster)
function LocalPlaceMarker({ place, showLabel, onVisit }) {
  return (
    <Marker
      position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
      icon={createMarkerIcon(place.categories?.[0]?.icon_path)}
    >
      {showLabel && (
        <Tooltip direction="top" offset={[0, -32]} permanent opacity={0.9} className="font-bold text-xs" style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.85)', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', padding: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {place.img && (
              <img src={place.img} alt={place.name} style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <span>{place.name}</span>
          </div>
        </Tooltip>
      )}
      <Popup>
        <div style={{ maxWidth: '220px', fontFamily: 'sans-serif' }}>
          <div style={{ marginBottom: '7px' }}>
            <span style={{ background: '#6B4B3A', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
              ✦ NuraLoka
            </span>
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a' }}>
            {place.name}
          </h4>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#777' }}>{place.address}</p>
          {place.categories?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: '600' }}>
                {place.categories[0].name}
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onVisit) onVisit(place);
            }}
            style={{ display: 'block', width: '100%', padding: '6px 0', background: '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
          >
            Lihat Detail
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

// Marker satuan untuk titik OSM (dari API) — lingkaran berwarna sesuai kategori
function OsmPlaceMarker({ place, showLabel }) {
  const color = OSM_COLORS[place.category] || OSM_COLORS['Lainnya'];
  return (
    <CircleMarker
      center={[place.latitude, place.longitude]}
      radius={7}
      pathOptions={{ color: 'white', weight: 2, fillColor: color, fillOpacity: 0.9 }}
    >
      {showLabel && (
        <Tooltip direction="top" offset={[0, -7]} permanent opacity={0.9} className="font-bold text-xs" style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.85)', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', padding: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {place.img && (
              <img src={place.img} alt={place.name} style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <span>{place.name}</span>
          </div>
        </Tooltip>
      )}
      <Popup>
        <div style={{ maxWidth: '220px', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '7px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0ea5e9', color: 'white', fontSize: '9px', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>
              🌐 OpenStreetMap
            </span>
            {place.category && (
              <span style={{ background: color, color: 'white', fontSize: '9px', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>
                {place.category}
              </span>
            )}
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a' }}>
            {place.name}
          </h4>
          {place.address && (
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#777' }}>{place.address}</p>
          )}
          {place.subtype && (
            <p style={{ margin: '0 0 7px 0', fontSize: '10px', color: '#aaa', textTransform: 'capitalize' }}>
              {String(place.subtype).replace(/_/g, ' ')}
            </p>
          )}
          <a
            href={`https://www.openstreetmap.org/node/${place.osmId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' }}
          >
            Lihat di OpenStreetMap ↗
          </a>
        </div>
      </Popup>
    </CircleMarker>
  );
}

// Render titik individual dari server (endpoint /jelajah/titik). Tanpa klaster:
// titik hanya muncul saat zoom cukup dekat, jadi peta bersih ketika zoom jauh.
function MapMarkers({ points = [], currentZoom = 5, onVisit }) {
  return (
    <>
      {points.map((p) => (
        p.source === 'osm' ? (
          <OsmPlaceMarker key={`osm-${p.id}`} place={p} showLabel={currentZoom >= 19} />
        ) : (
          <LocalPlaceMarker key={`admin-${p.id}`} place={p} showLabel={currentZoom >= 19} onVisit={onVisit} />
        )
      ))}
    </>
  );
}

// Marker khusus untuk titik yang dipilih lewat pencarian. Popup-nya terbuka OTOMATIS
// setelah peta selesai fly ke lokasi (sama seperti mengeklik ikon di peta), bukan
// langsung membuka halaman detail.
function SelectedPlaceMarker({ place, onVisit }) {
  const markerRef = React.useRef(null);
  const pendingRef = React.useRef(false);

  // Buka popup saat gerakan peta (flyTo) berhenti; fallback via timer bila peta tak bergerak.
  React.useEffect(() => {
    if (!place) return;
    pendingRef.current = true;
    const fallback = setTimeout(() => {
      if (pendingRef.current) {
        pendingRef.current = false;
        try { markerRef.current?.openPopup(); } catch (e) { /* noop */ }
      }
    }, 1800);
    return () => clearTimeout(fallback);
  }, [place]);

  useMapEvents({
    moveend: () => {
      if (pendingRef.current) {
        pendingRef.current = false;
        setTimeout(() => { try { markerRef.current?.openPopup(); } catch (e) { /* noop */ } }, 50);
      }
    },
  });

  if (!place || !place.latitude || !place.longitude) return null;

  const isOsm = place.source === 'osm';
  const color = OSM_COLORS[place.category] || OSM_COLORS['Lainnya'];

  return (
    <Marker
      ref={markerRef}
      position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
      icon={createMarkerIcon(!isOsm ? place.categories?.[0]?.icon_path : undefined)}
    >
      <Popup>
        <div style={{ maxWidth: '220px', fontFamily: 'sans-serif' }}>
          {isOsm ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '7px', flexWrap: 'wrap' }}>
              <span style={{ background: '#0ea5e9', color: 'white', fontSize: '9px', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>
                🌐 OpenStreetMap
              </span>
              {place.category && (
                <span style={{ background: color, color: 'white', fontSize: '9px', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {place.category}
                </span>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '7px' }}>
              <span style={{ background: '#6B4B3A', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
                ✦ NuraLoka
              </span>
            </div>
          )}
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a' }}>
            {place.name}
          </h4>
          {place.address && (
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#777' }}>{place.address}</p>
          )}
          {!isOsm && place.categories?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: '600' }}>
                {place.categories[0].name}
              </span>
            </div>
          )}
          {isOsm ? (
            <a
              href={`https://www.openstreetmap.org/node/${place.osmId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' }}
            >
              Lihat di OpenStreetMap ↗
            </a>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); if (onVisit) onVisit(place); }}
              style={{ display: 'block', width: '100%', padding: '6px 0', background: '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
            >
              Lihat Detail
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default function ExploreMap({
  places = [],            // hanya dipakai untuk menghitung center awal peta
  points = [],            // titik individual dari server
  selectedPlace = null,
  onVisit,
  routeData,
  origin,
  destination,
  onBoundsChange,
  onSettle,
}) {
  const defaultCenter = [-8.0, 113.0];
  const [center, setCenter] = React.useState(defaultCenter);
  const [currentZoom, setCurrentZoom] = React.useState(selectedPlace ? 15 : 5);

  React.useEffect(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      setCenter(routeData.coordinates[Math.floor(routeData.coordinates.length / 2)]);
    } else if (selectedPlace?.latitude && selectedPlace?.longitude) {
      setCenter([selectedPlace.latitude, selectedPlace.longitude]);
    } else if (places.length > 0) {
      const lat = places.reduce((sum, p) => sum + parseFloat(p.latitude || 0), 0) / places.length;
      const lng = places.reduce((sum, p) => sum + parseFloat(p.longitude || 0), 0) / places.length;
      setCenter([lat, lng]);
    }
  }, [selectedPlace, places, routeData]);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={selectedPlace ? 15 : 5}
        maxZoom={19}
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 0 }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Map updater for smooth animation */}
        <MapUpdater selectedPlace={selectedPlace} routeData={routeData} />

        {/* Bounds watcher — triggers OSM data fetch when user pans/zooms */}
        <BoundsWatcher onBoundsChange={onBoundsChange} onZoomChange={setCurrentZoom} onSettle={onSettle} />

        {/* Marker titik terpilih dari pencarian — popup terbuka otomatis.
            Disembunyikan saat ada rute (mode dua titik) agar tidak menimpa tampilan rute. */}
        {!routeData && <SelectedPlaceMarker place={selectedPlace} onVisit={onVisit} />}

        {/* Route Polyline */}
        {routeData && routeData.coordinates && (
          <Polyline
            positions={routeData.coordinates}
            color="#6B4B3A"
            weight={6}
            opacity={0.8}
          />
        )}

        {/* Origin Marker */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={createMarkerIcon()}>
            <Popup><b>A: Keberangkatan</b><br />{origin.name}</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={createMarkerIcon()}>
            <Popup><b>B: Tujuan</b><br />{destination.name}</Popup>
          </Marker>
        )}

        {/* ── Titik dari server (DB admin + OSM), muncul saat zoom cukup dekat ── */}
        <MapMarkers
          points={points}
          currentZoom={currentZoom}
          onVisit={onVisit}
        />
      </MapContainer>
    </div>
  );
}
