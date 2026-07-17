import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
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

// Escape teks agar aman disisipkan ke HTML divIcon (nama tempat bisa mengandung < " dll).
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Ikon default per-kategori (dipakai bila kategori belum punya icon_path di DB).
// Emoji dipilih agar ringan & tanpa aset; fallback terakhir 📍.
const CATEGORY_EMOJI = {
  'Wisata Alam': '🌿',
  'Wisata Budaya': '🏛️',
  'Wisata Sejarah': '🏯',
  'Wisata Gunung': '⛰️',
  'Wisata Edukasi': '📚',
  'Kuliner': '🍽️',
  'Wisata Kuliner': '🍽️',
  'Museum': '🏛️',
  'Taman Hiburan': '🎡',
  'Belanja': '🛍️',
  'Religi': '🕌',
  'Wisata Religi': '🕌',
  'Hidden Gem': '💎',
  'Pantai': '🏖️',
  'Wisata Pantai': '🏖️',
  'Air Terjun': '💧',
};

// Ikon POI: pin peta (teardrop) berisi ikon kategori + label nama menempel di
// sampingnya. Pin & label berada dalam SATU divIcon sehingga keduanya sama-sama
// bisa diinteraksikan (hover/klik memicu event marker yang sama).
const createPlaceIcon = (place) => {
  const category = place.categories?.[0];
  const inner = category?.icon_path
    ? `<img src="${escapeHtml(category.icon_path)}" alt="" />`
    : `<span class="nl-pin__emoji">${CATEGORY_EMOJI[category?.name] || '📍'}</span>`;

  return L.divIcon({
    className: 'nl-pin',
    html:
      `<div class="nl-pin__wrap">` +
        `<div class="nl-pin__pin"><span class="nl-pin__icon">${inner}</span></div>` +
        `<span class="nl-pin__label">${escapeHtml(place.name)}</span>` +
      `</div>`,
    iconSize: null,       // biarkan konten (pin + label) menentukan ukuran
    iconAnchor: [11, 31], // ujung bawah pin sebagai titik jangkar koordinat
    popupAnchor: [0, -30],
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

// Marker satuan untuk satu place (peta sisi user membaca satu sumber; tidak ada
// pembedaan asal data OSM/internal di UI).
function LocalPlaceMarker({ place, onVisit }) {
  return (
    <Marker
      position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
      icon={createPlaceIcon(place)}
      // Laptop: overlay muncul saat hover. Mobile: muncul saat tap (event click).
      // Pin & label satu divIcon → keduanya memicu event yang sama.
      eventHandlers={{
        mouseover: (e) => e.target.openPopup(),
        click: (e) => e.target.openPopup(),
      }}
    >
      <Popup>
        <div style={{ maxWidth: '220px', fontFamily: 'sans-serif' }}>
          <div style={{ marginBottom: '7px' }}>
            <span style={{ background: '#5A3812', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
              ✦ NuraLoka
            </span>
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#262626' }}>
            {place.name}
          </h4>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: place.address ? '#4D4D4D' : '#808080', fontStyle: place.address ? 'normal' : 'italic' }}>
            {place.address || 'Lokasi menanti untuk dijelajahi ✨'}
          </p>
          {place.categories?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ background: '#E9F7F6', color: '#239A90', fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: '600' }}>
                {place.categories[0].name}
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onVisit) onVisit(place);
            }}
            style={{ display: 'block', width: '100%', padding: '6px 0', background: '#239A90', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
          >
            Lihat Detail
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

// Render titik individual dari server (endpoint /jelajah/titik), dengan DECLUTTER
// ala Google Maps: titik yang saling berdekatan (berpotensi menumpuk) dijarangkan —
// hanya yang berprioritas lebih tinggi (urutan dari server) yang tampil, sisanya
// baru muncul saat diperbesar; pada zoom PALING BESAR semua titik ditampilkan.
// `excludeId` menyingkirkan titik yang sedang ditampilkan sebagai marker pencarian
// agar tidak dobel.
const MARKER_MIN_PX = 40; // jarak minimal antar pin (px) agar tidak menumpuk

function MapMarkers({ points = [], onVisit, excludeId = null, excludeLat = null, excludeLng = null }) {
  const map = useMap();
  const [tick, setTick] = React.useState(0);

  // Recompute declutter tiap kali zoom/geser peta (proyeksi piksel berubah).
  useMapEvents({
    zoomend: () => setTick((t) => t + 1),
    moveend: () => setTick((t) => t + 1),
  });

  const visible = React.useMemo(() => {
    // Singkirkan titik yang sedang tampil sebagai marker pencarian agar tidak dobel:
    // cocok berdasarkan id (toleran tipe), ATAU koordinat yang praktis sama (~5 m),
    // untuk menangani duplikat baris (mis. dua node OSM di lokasi yang sama).
    const hasExclude = excludeId != null || (excludeLat != null && excludeLng != null);
    const base = hasExclude
      ? points.filter((p) => {
          if (excludeId != null && Number(p.id) === Number(excludeId)) return false;
          if (excludeLat != null && excludeLng != null) {
            if (Math.abs(parseFloat(p.latitude) - excludeLat) < 5e-5 &&
                Math.abs(parseFloat(p.longitude) - excludeLng) < 5e-5) return false;
          }
          return true;
        })
      : points;
    if (!map) return base;

    const maxZoom = map.getMaxZoom ? map.getMaxZoom() : 19;
    // Zoom paling besar → tampilkan semua (tidak ada yang disembunyikan).
    if (map.getZoom() >= maxZoom) return base;

    // Grid hash berbasis piksel agar deteksi tumpang tindih tetap O(n).
    const cell = MARKER_MIN_PX;
    const grid = new Map();
    const kept = [];

    for (const p of base) {
      const pt = map.latLngToContainerPoint([parseFloat(p.latitude), parseFloat(p.longitude)]);
      const cx = Math.floor(pt.x / cell);
      const cy = Math.floor(pt.y / cell);
      let collide = false;

      for (let dx = -1; dx <= 1 && !collide; dx++) {
        for (let dy = -1; dy <= 1 && !collide; dy++) {
          const bucket = grid.get(`${cx + dx},${cy + dy}`);
          if (bucket) {
            for (const q of bucket) {
              if ((pt.x - q.x) ** 2 + (pt.y - q.y) ** 2 < cell * cell) { collide = true; break; }
            }
          }
        }
      }

      if (!collide) {
        kept.push(p);
        const key = `${cx},${cy}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(pt);
      }
    }

    return kept;
  }, [points, excludeId, excludeLat, excludeLng, map, tick]);

  return (
    <>
      {visible.map((p) => (
        <LocalPlaceMarker key={`place-${p.id}`} place={p} onVisit={onVisit} />
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

  return (
    <Marker
      ref={markerRef}
      position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
      icon={createPlaceIcon(place)}
    >
      <Popup>
        <div style={{ maxWidth: '220px', fontFamily: 'sans-serif' }}>
          <div style={{ marginBottom: '7px' }}>
            <span style={{ background: '#5A3812', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
              ✦ NuraLoka
            </span>
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#262626' }}>
            {place.name}
          </h4>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: place.address ? '#4D4D4D' : '#808080', fontStyle: place.address ? 'normal' : 'italic' }}>
            {place.address || 'Lokasi menanti untuk dijelajahi ✨'}
          </p>
          {place.categories?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ background: '#E9F7F6', color: '#239A90', fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: '600' }}>
                {place.categories[0].name}
              </span>
            </div>
          )}
          {place.slug && (
            <button
              onClick={(e) => { e.stopPropagation(); if (onVisit) onVisit(place); }}
              style={{ display: 'block', width: '100%', padding: '6px 0', background: '#239A90', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
            >
              Lihat Detail
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// Ikon mobil untuk animasi perjalanan.
const journeyCarIcon = L.divIcon({
  className: 'nl-journey-car',
  html: '<div style="font-size:24px;line-height:34px;text-align:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚗</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Marker mobil: mode demo → animasi menyusuri garis rute (panggil onComplete saat habis);
// mode real → mengikuti posisi GPS user.
function JourneyCar({ routeData, running, demo, userPosition, onComplete }) {
  const [pos, setPos] = React.useState(null);
  const rafRef = React.useRef(null);
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  React.useEffect(() => {
    if (!running || !demo) { setPos(null); return; }
    const coords = routeData?.coordinates;
    if (!coords || coords.length === 0) return;

    const DURATION = 8000; // durasi animasi demo (ms)
    let start = null;
    let done = false;
    const step = (ts) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / DURATION);
      const idx = Math.min(coords.length - 1, Math.floor(t * (coords.length - 1)));
      setPos(coords[idx]);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else if (!done) {
        done = true;
        onCompleteRef.current?.();
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, demo, routeData]);

  if (!running) return null;
  const carPos = demo ? pos : (userPosition ? [userPosition.lat, userPosition.lng] : routeData?.coordinates?.[0]);
  if (!carPos) return null;

  return <Marker position={carPos} icon={journeyCarIcon} zIndexOffset={1000} />;
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
  journeyRunning = false, // perjalanan 2 titik sedang berjalan
  journeyDemo = true,     // true = animasi mobil; false = ikuti GPS user
  userPosition = null,    // posisi GPS user (mode real)
  onJourneyComplete,      // dipanggil saat animasi demo selesai
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
            color="#5A3812"
            weight={6}
            opacity={0.8}
          />
        )}

        {/* Mobil perjalanan (animasi demo / ikuti GPS real) */}
        <JourneyCar
          routeData={routeData}
          running={journeyRunning}
          demo={journeyDemo}
          userPosition={userPosition}
          onComplete={onJourneyComplete}
        />

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

        {/* ── Titik dari server (satu jenis), kepadatan diatur level-of-detail + declutter.
            excludeId: hindari dobel dengan marker hasil pencarian yang sedang tampil. ── */}
        <MapMarkers
          points={points}
          onVisit={onVisit}
          excludeId={!routeData && selectedPlace ? (selectedPlace.placeId ?? selectedPlace.id) : null}
          excludeLat={!routeData && selectedPlace?.latitude != null ? parseFloat(selectedPlace.latitude) : null}
          excludeLng={!routeData && selectedPlace?.longitude != null ? parseFloat(selectedPlace.longitude) : null}
        />
      </MapContainer>
    </div>
  );
}
