import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
    // Return default icon if no path provided
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

  // Create custom icon from provided path
  return L.icon({
    iconUrl: iconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map centering when selected place changes
const MapUpdater = ({ selectedPlace }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [selectedPlace, map]);

  return null;
};

export default function ExploreMap({ places = [], selectedPlace = null, onVisit }) {
  // Default center (Indonesia center)
  const defaultCenter = [-8.0, 113.0];
  const [center, setCenter] = React.useState(defaultCenter);

  // Update center when selected place changes
  React.useEffect(() => {
    if (selectedPlace?.latitude && selectedPlace?.longitude) {
      setCenter([selectedPlace.latitude, selectedPlace.longitude]);
    } else if (places.length > 0) {
      // Calculate center from all places
      const lat = places.reduce((sum, p) => sum + parseFloat(p.latitude || 0), 0) / places.length;
      const lng = places.reduce((sum, p) => sum + parseFloat(p.longitude || 0), 0) / places.length;
      setCenter([lat, lng]);
    }
  }, [selectedPlace, places]);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={selectedPlace ? 15 : 5}
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 0 }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Map updater for smooth animation */}
        <MapUpdater selectedPlace={selectedPlace} />

        {/* Markers for all places */}
        {places.map(place => {
          // Get icon path from first category if available
          const categoryIcon = place.categories?.[0]?.icon_path;
          const markerIcon = createMarkerIcon(categoryIcon);

          return (
            <Marker
              key={place.id}
              position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onVisit) onVisit(place);
                },
              }}
            >
              <Popup>
                <div style={{ maxWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    {place.name}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                    {place.address}
                  </p>
                  {place.categories?.length > 0 && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#999' }}>
                      Category: {place.categories[0].name}
                    </p>
                  )}
                  <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>
                    Lat: {parseFloat(place.latitude).toFixed(6)}, Lng: {parseFloat(place.longitude).toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
