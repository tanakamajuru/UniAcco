import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function ListingMap({ results = [], selectedId = null, activeUni = null, onSelect = null }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use university lat/lng or default to Harare
    const initialLat = activeUni?.lat ? parseFloat(activeUni.lat) : -17.78537;
    const initialLng = activeUni?.lng ? parseFloat(activeUni.lng) : 31.05311;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false, // We'll add zoom control at the bottom right
      attributionControl: false,
    });

    // Add zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add light-themed modern tile layer (CartoDB Positron is very clean and Airbnb-like)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when university changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeUni) return;

    const lat = parseFloat(activeUni.lat);
    const lng = parseFloat(activeUni.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 13, { animate: true });
    }
  }, [activeUni]);

  // Update markers when results or selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers that are no longer in results
    const resultIds = new Set(results.map(r => r.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!resultIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    results.forEach(acc => {
      const lat = parseFloat(acc.lat);
      const lng = parseFloat(acc.lng);
      if (isNaN(lat) || isLngNaN(lng)) return; // skip items without valid coordinates

      const isSelected = selectedId === acc.id;
      
      // Create custom price badge HTML icon
      const iconHtml = `
        <div class="transition-all duration-200 shadow-md rounded-full px-2.5 py-1 text-[13px] font-extrabold border-2 text-center whitespace-nowrap
          ${isSelected 
            ? 'bg-slate-900 border-slate-950 text-white scale-110 z-[1000]' 
            : 'bg-white border-slate-200 text-slate-900 hover:scale-105 hover:bg-slate-50'
          }">
          $${acc.price_per_month}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-price-marker',
        html: iconHtml,
        iconSize: [50, 28],
        iconAnchor: [25, 14],
      });

      if (markersRef.current[acc.id]) {
        // Update existing marker icon & zIndex
        const marker = markersRef.current[acc.id];
        marker.setIcon(customIcon);
        if (isSelected) {
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
        }
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { 
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 0
        }).addTo(map);

        // Marker interactions
        marker.on('click', () => {
          if (onSelect) {
            onSelect(acc);
          }
        });

        // Add popup with property overview
        const photo = acc.images?.[0] ? acc.images[0] : null;
        const photoUrl = photo ? (photo.startsWith('http') ? photo : `http://localhost:5000${photo}`) : null;
        
        const popupContent = `
          <div class="w-48 overflow-hidden font-sans">
            ${photoUrl 
              ? `<img src="${photoUrl}" class="h-24 w-full object-cover rounded-t-lg" alt="${acc.title}" />` 
              : `<div class="h-24 w-full bg-slate-100 flex items-center justify-center rounded-t-lg text-slate-400">No Image</div>`
            }
            <div class="p-2 bg-white rounded-b-lg">
              <div class="text-[11.5px] font-bold uppercase tracking-wide text-brand-primaryDark mb-0.5">${acc.type}</div>
              <h4 class="font-bold text-[13px] text-slate-800 line-clamp-1 m-0">${acc.title}</h4>
              <p class="text-[11px] text-slate-500 m-0">${acc.suburb || ''}</p>
              <div class="flex justify-between items-center mt-1 border-t border-slate-100 pt-1">
                <span class="font-extrabold text-[13px] text-slate-900">$${acc.price_per_month}/mo</span>
                <span class="text-[11px] font-medium text-brand-primaryDark">${acc.walk_minutes || '0'} min walk</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -10],
          className: 'custom-leaflet-popup'
        });

        // Open popup on hover
        marker.on('mouseover', function () {
          this.openPopup();
        });

        markersRef.current[acc.id] = marker;
      }
    });

    // Helper function to check lng NaN
    function isLngNaN(val) {
      return isNaN(val);
    }

  }, [results, selectedId, onSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
      
      {/* Leaflet Custom Style Overrides */}
      <style>{`
        .leaflet-container {
          background-color: #f1f5f9;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: 192px !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          box-shadow: 0 3px 14px rgba(0,0,0,0.1);
        }
        .custom-price-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
