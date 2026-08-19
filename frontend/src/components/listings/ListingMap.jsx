import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { campusIcon, homeIcon, homeIconActive } from './mapIcons';

// Recenter/zoom so the campus + all property pins fit whenever they change.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 15 });
  }, [points, map]);
  return null;
}

export default function ListingMap({ results = [], selectedId, activeUni, onSelect }) {
  const campus =
    activeUni?.lat != null && activeUni?.lng != null ? [Number(activeUni.lat), Number(activeUni.lng)] : null;

  const homes = useMemo(
    () => results.filter((a) => a.lat != null && a.lng != null),
    [results]
  );

  const points = useMemo(() => {
    const pts = homes.map((a) => [Number(a.lat), Number(a.lng)]);
    if (campus) pts.push(campus);
    return pts;
  }, [homes, campus]);

  const center = campus || (points[0] ?? [-17.8252, 31.0335]); // fallback: Harare

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" style={{ background: '#e5eef3' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      {campus && (
        <Marker position={campus} icon={campusIcon} zIndexOffset={1000}>
          <Popup>
            <strong>{activeUni?.short || 'Campus'}</strong>
            <br />
            {activeUni?.name || activeUni?.city}
          </Popup>
        </Marker>
      )}

      {homes.map((a) => (
        <Marker
          key={a.id}
          position={[Number(a.lat), Number(a.lng)]}
          icon={selectedId === a.id ? homeIconActive : homeIcon}
          eventHandlers={{ click: () => onSelect?.(a) }}
        >
          <Popup>
            <strong>{a.title}</strong>
            <br />${a.price_per_month}/mo
            {a.walk_minutes != null && (
              <>
                <br />
                {a.walk_minutes} min walk{a.distance_km != null ? ` · ${a.distance_km} km` : ''}
              </>
            )}
            <br />
            <button
              onClick={() => onSelect?.(a)}
              style={{ marginTop: 6, color: '#2F8FB8', fontWeight: 700, cursor: 'pointer' }}
            >
              View details →
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
