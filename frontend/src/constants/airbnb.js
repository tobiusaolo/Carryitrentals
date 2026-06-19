/** Short-stay (Airbnb) listing and booking labels — aligned with backend */

import { COUNTRY_OPTIONS, CURRENCY_OPTIONS, DEFAULT_RENTAL_COUNTRY, DEFAULT_RENTAL_CURRENCY } from './rentalUnit';

export { COUNTRY_OPTIONS, CURRENCY_OPTIONS, DEFAULT_RENTAL_COUNTRY, DEFAULT_RENTAL_CURRENCY };

export const AIRBNB_LISTING_STATUS_OPTIONS = [
  { value: 'available', label: 'Open for bookings', hint: 'Guests can request dates' },
  { value: 'booked', label: 'Fully booked', hint: 'Blocked until you change status' },
  { value: 'unavailable', label: 'Unavailable', hint: 'Hidden from new requests (maintenance, etc.)' },
];

export const AIRBNB_BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'success' },
  { value: 'completed', label: 'Completed', color: 'info' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
];

export const MIN_AIRBNB_IMAGES = 5;
export const MAX_AIRBNB_IMAGES = 10;

/** Must match backend AirbnbPropertyType enum */
export const AIRBNB_PROPERTY_TYPE_OPTIONS = [
  { value: 'entire_apartment', label: 'Entire apartment', hint: 'Full apartment for guests' },
  { value: 'entire_house', label: 'Entire house', hint: 'Standalone home' },
  { value: 'villa', label: 'Villa', hint: 'Luxury or large standalone home' },
  { value: 'guesthouse', label: 'Guesthouse', hint: 'Separate guest unit on a property' },
  { value: 'cottage', label: 'Cottage', hint: 'Small standalone home' },
  { value: 'studio', label: 'Studio', hint: 'Open-plan single room' },
  { value: 'private_room', label: 'Private room', hint: 'Private bedroom, shared spaces' },
  { value: 'shared_room', label: 'Shared room', hint: 'Shared sleeping space' },
  { value: 'serviced_apartment', label: 'Serviced apartment', hint: 'Hotel-style serviced unit' },
  { value: 'boutique_hotel', label: 'Boutique hotel', hint: 'Small hotel or lodge room' },
  { value: 'townhouse', label: 'Townhouse', hint: 'Row or terrace home' },
  { value: 'beach_house', label: 'Beach house', hint: 'Coastal or lakeside stay' },
];

export const DEFAULT_AIRBNB_PROPERTY_TYPE = 'entire_apartment';

const LEGACY_AIRBNB_PROPERTY_TYPE = {
  apartment: 'entire_apartment',
  house: 'entire_house',
  condo: 'entire_apartment',
  entire_place: 'entire_apartment',
};

export function normalizeAirbnbPropertyType(value) {
  if (!value) return DEFAULT_AIRBNB_PROPERTY_TYPE;
  const v = String(value).toLowerCase();
  if (AIRBNB_PROPERTY_TYPE_OPTIONS.some((o) => o.value === v)) return v;
  return LEGACY_AIRBNB_PROPERTY_TYPE[v] || DEFAULT_AIRBNB_PROPERTY_TYPE;
}

export function getAirbnbPropertyTypeLabel(value) {
  const normalized = normalizeAirbnbPropertyType(value);
  const opt = AIRBNB_PROPERTY_TYPE_OPTIONS.find((o) => o.value === normalized);
  return opt ? opt.label : normalized.replace(/_/g, ' ');
}

export const emptyAirbnbFormState = () => ({
  property_id: '',
  title: '',
  description: '',
  location: '',
  country: DEFAULT_RENTAL_COUNTRY,
  property_type: DEFAULT_AIRBNB_PROPERTY_TYPE,
  price_per_night: '',
  currency: DEFAULT_RENTAL_CURRENCY,
  max_guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  amenities: '',
  house_rules: '',
  is_available: 'available',
});

export function getListingStatusMeta(status) {
  const key = status || 'available';
  const base = AIRBNB_LISTING_STATUS_OPTIONS.find((o) => o.value === key) || {
    label: key,
    value: key,
  };
  const palette = {
    available: { chipColor: '#0d7a4a', chipBg: '#e8f5ee', isAvailable: true },
    booked: { chipColor: '#6b2d2d', chipBg: '#fce8e8', isAvailable: false },
    unavailable: { chipColor: '#6b7280', chipBg: '#f3f4f6', isAvailable: false },
  };
  return { ...base, ...(palette[key] || palette.available) };
}

export function getBookingStatusMeta(status) {
  const normalized = status === 'approved' ? 'confirmed' : status;
  return (
    AIRBNB_BOOKING_STATUS_OPTIONS.find((o) => o.value === normalized) || {
      label: normalized,
      value: normalized,
      color: 'default',
    }
  );
}

/** Nights between check-in and check-out (checkout day excluded). */
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateStayTotal(pricePerNight, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  const rate = parseFloat(pricePerNight) || 0;
  return { nights, total: nights * rate };
}
