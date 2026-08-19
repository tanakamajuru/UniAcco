import L from 'leaflet';

// Teardrop pin with a centered white glyph, built as a Leaflet divIcon so we
// don't depend on Leaflet's default marker image assets.
const pin = (bg, innerSvg, size = 1) => {
  const w = Math.round(32 * size);
  const h = Math.round(42 * size);
  return L.divIcon({
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 6],
    html: `
      <div style="position:relative;width:${w}px;height:${h}px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));">
        <svg width="${w}" height="${h}" viewBox="0 0 32 42">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="${bg}"/>
        </svg>
        <div style="position:absolute;top:${Math.round(7 * size)}px;left:0;width:${w}px;display:flex;justify-content:center;">
          ${innerSvg}
        </div>
      </div>`,
  });
};

const HOME_SVG = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.4 12 4l9 7.4"/><path d="M5.5 10v9h13v-9"/></svg>`;
const CAP_SVG = `<svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3z"/><path d="M5 13.2V17c0 1.9 3.1 3 7 3s7-1.1 7-3v-3.8l-7 3.8-7-3.8z"/></svg>`;

// Campus = red pin with a graduation cap.
export const campusIcon = pin('#EF4444', CAP_SVG, 1.1);
// Property = brand-blue pin with a home glyph; accent gold when selected.
export const homeIcon = pin('#2F8FB8', HOME_SVG);
export const homeIconActive = pin('#0F172A', HOME_SVG, 1.2);
