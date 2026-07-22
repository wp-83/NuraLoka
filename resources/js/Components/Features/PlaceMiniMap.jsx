import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin } from 'react-icons/fi';

// Repair Leaflet's default marker icon, which breaks once bundled.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Small preview map: one place at high zoom, showing just its surroundings.
export default function PlaceMiniMap({ latitude, longitude, name, zoom = 16 }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return (
            <div className="flex h-full w-full items-center justify-center gap-2 bg-gray-10 font-body text-small text-gray-50">
                <FiMapPin size={18} /> Lokasi belum tersedia
            </div>
        );
    }

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            maxZoom={19}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
            />
            <Marker position={[lat, lng]}>
                {name && <Popup>{name}</Popup>}
            </Marker>
        </MapContainer>
    );
}
