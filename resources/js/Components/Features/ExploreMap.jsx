import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiCrosshair } from 'react-icons/fi';
import { categoryEmoji, categoryIconUrl } from '@js/categoryIcons';

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

// Escape text before it goes into a divIcon's HTML (a place name may contain <, ", etc.).
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// The emoji map and category-image resolution live in @js/categoryIcons, so map
// pins, place cards and detail pages all use exactly the same icon.

// POI icon: a teardrop pin holding the category icon, with the name label beside
// it. Pin and label sit in ONE divIcon so both are interactive — hovering or
// clicking either fires the same marker event.
const createPlaceIcon = (place) => {
  const category = place.categories?.[0];
  const iconUrl = categoryIconUrl(category);

  const inner = iconUrl
    ? `<img src="${escapeHtml(iconUrl)}" alt="" />`
    : `<span class="nl-pin__emoji">${categoryEmoji(category?.name)}</span>`;

  return L.divIcon({
    className: 'nl-pin',
    html:
      `<div class="nl-pin__wrap">` +
        `<div class="nl-pin__pin"><span class="nl-pin__icon">${inner}</span></div>` +
        `<span class="nl-pin__label">${escapeHtml(place.name)}</span>` +
      `</div>`,
    iconSize: null,       // let the content (pin + label) decide the size
    iconAnchor: [11, 31], // the pin's tip is the anchor on the coordinate
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
      // The map has finished moving (including after a flyTo to the selection).
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

// A single place marker. The user-facing map reads one source; the UI draws no
// distinction between OSM and internal data.
function LocalPlaceMarker({ place, onVisit }) {
  return (
    <Marker
      position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
      icon={createPlaceIcon(place)}
      // Laptop: the overlay appears on hover. Mobile: on tap (the click event).
      // Pin and label share one divIcon, so both fire the same event.
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

// Renders the individual points from the server (the /jelajah/titik endpoint),
// with Google-Maps-style DECLUTTERING: points close enough to overlap are
// thinned out, so only the higher-priority ones (the server's order) show and
// the rest appear as you zoom in. At MAXIMUM zoom every point is drawn.
//
// `excludeId` drops the point currently shown as the search marker, so it is not
// rendered twice.
const MARKER_MIN_PX = 40; // minimum gap between pins, in px, to avoid overlap

function MapMarkers({ points = [], onVisit, excludeId = null, excludeLat = null, excludeLng = null, excludeIds = null }) {
  const map = useMap();
  const [tick, setTick] = React.useState(0);

  // Recompute the declutter on every zoom or pan: the pixel projection moves.
  useMapEvents({
    zoomend: () => setTick((t) => t + 1),
    moveend: () => setTick((t) => t + 1),
  });

  const visible = React.useMemo(() => {
    // Drop the point already drawn as the search marker so it is not doubled:
    // matched by id (type-tolerant) OR by practically identical coordinates
    // (~5 m), which covers duplicate rows such as two OSM nodes at one spot.
    // excludeIds holds route waypoint ids, drawn as their own layer.
    const hasExclude = excludeId != null || (excludeLat != null && excludeLng != null) || (excludeIds && excludeIds.size > 0);
    const base = hasExclude
      ? points.filter((p) => {
          if (excludeId != null && Number(p.id) === Number(excludeId)) return false;
          if (excludeIds && excludeIds.has(Number(p.id))) return false;
          if (excludeLat != null && excludeLng != null) {
            if (Math.abs(parseFloat(p.latitude) - excludeLat) < 5e-5 &&
                Math.abs(parseFloat(p.longitude) - excludeLng) < 5e-5) return false;
          }
          return true;
        })
      : points;
    if (!map) return base;

    const maxZoom = map.getMaxZoom ? map.getMaxZoom() : 19;
    // At maximum zoom show everything — nothing is hidden.
    if (map.getZoom() >= maxZoom) return base;

    // A pixel-based grid hash keeps overlap detection O(n).
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
  }, [points, excludeId, excludeLat, excludeLng, excludeIds, map, tick]);

  return (
    <>
      {visible.map((p) => (
        <LocalPlaceMarker key={`place-${p.id}`} place={p} onVisit={onVisit} />
      ))}
    </>
  );
}

// The marker for a point chosen through search. Its popup opens AUTOMATICALLY
// once the map has finished flying there — the same result as clicking the icon
// on the map — rather than jumping straight to the detail page.
function SelectedPlaceMarker({ place, onVisit }) {
  const markerRef = React.useRef(null);
  const pendingRef = React.useRef(false);

  // Open the popup when the map movement (flyTo) ends, with a timer fallback
  // for when the map does not move at all.
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

// The car icon used by the journey animation.
const journeyCarIcon = L.divIcon({
  className: 'nl-journey-car',
  html: '<div style="font-size:24px;line-height:34px;text-align:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚗</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// The car marker. In demo mode it animates along the route line and calls
// onComplete when it runs out; in real mode it follows the user's GPS position.
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

// The blue "my location" dot, deliberately unlike the teardrop place pins so it
// reads as the user's position rather than a destination.
const createMyLocationIcon = () =>
  L.divIcon({
    className: 'nl-mylocation',
    html:
      `<span style="` +
        `display:block;width:16px;height:16px;border-radius:9999px;` +
        `background:#1B86FF;border:3px solid #fff;` +
        `box-shadow:0 0 0 1px rgba(0,0,0,.25),0 2px 6px rgba(0,0,0,.35);` +
      `"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

/**
 * The "My Location" button.
 *
 * Must live INSIDE MapContainer, because it uses useMap() to move the map to the
 * user's position. Clicks are stopped from reaching the map
 * (disableClickPropagation) so pressing it does not also pan or zoom.
 */
function MyLocationControl({ onLocated }) {
  const map = useMap();
  const holderRef = React.useRef(null);

  // idle | locating | denied | unavailable
  const [status, setStatus] = React.useState('idle');

  React.useEffect(() => {
    if (holderRef.current) {
      L.DomEvent.disableClickPropagation(holderRef.current);
      L.DomEvent.disableScrollPropagation(holderRef.current);
    }
  }, []);

  const locate = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        setStatus('idle');
        onLocated?.(found);

        // Do not pull the view back out if the user is already zoomed closer.
        map.flyTo([found.lat, found.lng], Math.max(map.getZoom(), 16), {
          duration: 1.2,
        });
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const label = {
    idle: 'Lokasi Saya',
    locating: 'Mencari lokasi…',
    denied: 'Izin lokasi ditolak',
    unavailable: 'Lokasi tidak tersedia',
  }[status];

  return (
    // Placed TOP CENTRE: the bottom-right corner belongs to MapTooltip (the
    // mascot), and on desktop the left panel fills columns 1-4 while the right
    // panel fills 10-13 — top centre is the only clear space. Leaflet's zoom
    // control sits top-left, so there is no collision there either.
    //
    // The z-index matches Leaflet's control level (1000). Leaflet's own panes
    // reach 600 for markers and 700 for popups, so anything below that would
    // leave the button hidden behind a marker.
    <div
      ref={holderRef}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]"
    >
      <button
        type="button"
        onClick={locate}
        disabled={status === 'locating'}
        title={label}
        aria-label={label}
        className="
          flex items-center gap-2
          whitespace-nowrap rounded-xl
          border border-gray-20 bg-white
          px-3 py-2.5
          font-body text-small font-semibold
          text-primary shadow-lg
          transition-colors

          hover:bg-primary-10
          disabled:cursor-not-allowed disabled:opacity-70
        "
      >
        <FiCrosshair
          size={18}
          className={`shrink-0 ${status === 'locating' ? 'animate-spin' : ''}`}
        />

        <span className="hidden sm:inline">{label}</span>
      </button>
    </div>
  );
}

export default function ExploreMap({
  places = [],            // only used to compute the map's initial centre
  points = [],            // the individual points from the server
  selectedPlace = null,
  onVisit,
  routeData,
  origin,
  destination,
  onBoundsChange,
  onSettle,
  journeyRunning = false, // a two-point journey is under way
  journeyDemo = true,     // true = animate the car; false = follow the user's GPS
  userPosition = null,    // the user's GPS position (real mode)
  onJourneyComplete,      // called when the demo animation finishes
}) {
  const defaultCenter = [-8.0, 113.0];
  const [center, setCenter] = React.useState(defaultCenter);
  const [currentZoom, setCurrentZoom] = React.useState(selectedPlace ? 15 : 5);

  // The result of the "My Location" button. Kept separate from the userPosition
  // prop: that one tracks GPS while a journey is running, whereas this simply
  // marks where the user was when they pressed the button.
  const [myLocation, setMyLocation] = React.useState(null);

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

        {/* The marker for a search selection; its popup opens automatically.
            Hidden while a route exists (two-point mode) so it does not sit on
            top of the route. */}
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

        {/* Route waypoints: ALWAYS drawn as soon as a route exists, regardless
            of the server's zoom budget or the declutter. These are the required
            and recommended stops the route passes through, so they must be
            visible immediately even while the map is zoomed out. */}
        {routeData?.waypoints?.map((w) => (
          <LocalPlaceMarker key={`wp-${w.id}`} place={w} onVisit={onVisit} />
        ))}

        {/* Points from the server (one kind), thinned by level-of-detail plus
            declutter. excludeId avoids doubling the visible search marker;
            excludeIds avoids doubling the route waypoints drawn above. */}
        <MapMarkers
          points={points}
          onVisit={onVisit}
          excludeId={!routeData && selectedPlace ? (selectedPlace.placeId ?? selectedPlace.id) : null}
          excludeLat={!routeData && selectedPlace?.latitude != null ? parseFloat(selectedPlace.latitude) : null}
          excludeLng={!routeData && selectedPlace?.longitude != null ? parseFloat(selectedPlace.longitude) : null}
          excludeIds={routeData?.waypoints?.length ? new Set(routeData.waypoints.map((w) => Number(w.id))) : null}
        />

        {/* ── Lokasi pengguna (hasil tombol "Lokasi Saya") ── */}
        {myLocation && (
          <>
            {/* Lingkaran akurasi: memberi tahu seberapa presisi pembacaan GPS-nya. */}
            {myLocation.accuracy > 0 && (
              <Circle
                center={[myLocation.lat, myLocation.lng]}
                radius={myLocation.accuracy}
                pathOptions={{
                  color: '#1B86FF',
                  weight: 1,
                  fillColor: '#1B86FF',
                  fillOpacity: 0.12,
                }}
              />
            )}

            <Marker
              position={[myLocation.lat, myLocation.lng]}
              icon={createMyLocationIcon()}
              zIndexOffset={1000}
            >
              <Popup>Lokasi kamu sekarang</Popup>
            </Marker>
          </>
        )}

        <MyLocationControl onLocated={setMyLocation} />
      </MapContainer>
    </div>
  );
}
