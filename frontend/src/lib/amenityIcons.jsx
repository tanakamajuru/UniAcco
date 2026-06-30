import { Wifi, Sofa, Utensils, WashingMachine, Sun, Car, Tv, Droplets, Home } from 'lucide-react';

// Maps amenity ids (and lucide icon names from the API) to components.
const ICONS = {
  wifi: Wifi,
  Wifi,
  furnished: Sofa,
  Sofa,
  kitchen: Utensils,
  Utensils,
  laundry: WashingMachine,
  WashingMachine,
  heating: Sun,
  Sun,
  parking: Car,
  Car,
  tv: Tv,
  Tv,
  water: Droplets,
  Droplets,
};

export const LABELS = {
  wifi: 'WiFi',
  furnished: 'Furnished',
  kitchen: 'Kitchen',
  laundry: 'Laundry',
  heating: 'Solar backup',
  parking: 'Parking',
  tv: 'DSTV',
  water: 'Borehole',
};

export const ALL_AMENITIES = ['wifi', 'furnished', 'kitchen', 'laundry', 'heating', 'parking', 'tv', 'water'];

export function AmenityIcon({ id, className }) {
  const Icon = ICONS[id] || Home;
  return <Icon className={className} />;
}

export default ICONS;
