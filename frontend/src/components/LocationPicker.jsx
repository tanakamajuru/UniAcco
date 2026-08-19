import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { campusIcon, homeIcon } from './listings/mapIcons';

function ClickCapture({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Recenter when the campus reference changes (e.g. host switches university).
function Recenter({ center }) {
  const map = useMap();
  const key = center ? `${center[0]},${center[1]}` : '';
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Click-to-drop-a-pin map for setting a property's coordinates.
 * @param value  {lat,lng} | null
 * @param campus [lat,lng] | null  (shown as a red reference pin)
 * @param onChange (lat, lng) => void
 */
export default function LocationPicker({ value, campus, onChange }) {
  const center = value ? [value.lat, value.lng] : campus || [-17.8252, 31.0335];
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-[260px] w-full">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={campus} />
      <ClickCapture onPick={onChange} />
      {campus && <Marker position={campus} icon={campusIcon} />}
      {value && <Marker position={[value.lat, value.lng]} icon={homeIcon} />}
    </MapContainer>
  );
}
