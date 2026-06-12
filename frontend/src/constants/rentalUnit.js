/** Shared rental listing constants — keep admin, owner, agent, and public UI aligned. */

export const DEFAULT_RENTAL_COUNTRY = 'Uganda';
export const DEFAULT_RENTAL_CURRENCY = 'UGX';
export const MIN_RENTAL_LISTING_IMAGES = 5;
export const DEFAULT_INSPECTION_FEE_UGX = 50000;
export const IMAGE_SEPARATOR = '|||IMAGE_SEPARATOR|||';

export const UNIT_TYPE_OPTIONS = [
  { group: 'Residential', options: [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'semi_detached', label: 'Semi-Detached' },
    { value: 'one_bedroom', label: '1 Bedroom' },
    { value: 'two_bedroom', label: '2 Bedroom' },
    { value: 'three_bedroom', label: '3 Bedroom' },
    { value: 'penthouse', label: 'Penthouse' },
  ]},
  { group: 'Commercial', options: [
    { value: 'office', label: 'Office Space' },
    { value: 'shop', label: 'Shop / Storefront' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'co_working', label: 'Co-Working Space' },
    { value: 'storage', label: 'Storage Unit' },
  ]},
];

const COMMERCIAL_TYPES = ['office', 'shop', 'warehouse', 'co_working', 'storage'];
export const isCommercialUnit = (type) => COMMERCIAL_TYPES.includes(type);

/** Legacy values stored before enum alignment */
export const LEGACY_UNIT_TYPE_MAP = {
  apartment: 'one_bedroom',
  house: 'semi_detached',
  villa: 'penthouse',
  mansion: 'penthouse',
};

export const CURRENCY_OPTIONS = [
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'RWF', label: 'RWF - Rwandan Franc' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

export const COUNTRY_OPTIONS = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan',
  'Ethiopia', 'Somalia', 'Djibouti', 'Eritrea', 'Sudan', 'Other',
];

export const BOOKING_TIME_SLOTS = [
  { value: 'morning', label: 'Morning (8am–12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm–5pm)' },
  { value: 'evening', label: 'Evening (5pm–8pm)' },
];

export function normalizeUnitType(unitType) {
  if (!unitType) return 'one_bedroom';
  const raw = typeof unitType === 'object' && unitType.value ? unitType.value : unitType;
  const key = String(raw).toLowerCase();
  return LEGACY_UNIT_TYPE_MAP[key] || key;
}

export function parseAgentId(agentId) {
  if (agentId === null || agentId === undefined || agentId === '') return null;
  return String(agentId);
}

export const emptyRentalFormState = () => ({
  property_id: '',
  internal_unit_id: '',
  title: '',
  location: '',
  country: DEFAULT_RENTAL_COUNTRY,
  unit_type: 'one_bedroom',
  floor: '',
  bedrooms: '',
  bathrooms: '',
  square_feet: '',
  monthly_rent: '',
  currency: DEFAULT_RENTAL_CURRENCY,
  status: 'available',
  description: '',
  amenities: '',
  is_furnished: false,
  images: '',
  agent_id: '',
});
