/** Property (building / land) types — matches backend PropertyType enum */

import { COUNTRY_OPTIONS, DEFAULT_RENTAL_COUNTRY } from './rentalUnit';

export { COUNTRY_OPTIONS, DEFAULT_RENTAL_COUNTRY };

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'house', label: 'House', hint: 'Standalone home (villa, bungalow, detached)' },
  { value: 'apartment', label: 'Apartment building', hint: 'Multi-unit building you manage as one property' },
  { value: 'condo', label: 'Condominium', hint: 'Owned units in a shared building' },
  { value: 'townhouse', label: 'Townhouse', hint: 'Row or terrace homes' },
  { value: 'multi_family', label: 'Multi-family', hint: 'Duplexes, triplexes, or fourplexes' },
  { value: 'commercial', label: 'Commercial', hint: 'General purpose commercial real estate' },
  { value: 'office', label: 'Office building', hint: 'Professional suites or corporate buildings' },
  { value: 'retail', label: 'Retail', hint: 'Shopping centers or standalone shops' },
  { value: 'warehouse', label: 'Warehouse / industrial', hint: 'Storage, distribution, or manufacturing' },
  { value: 'land', label: 'Land / plot', hint: 'Vacant land for sale, lease, or future development' },
];

export const LISTING_INTENT_OPTIONS = [
  { value: 'rent', label: 'For rent', hint: 'Long-term rental portfolio' },
  { value: 'sale', label: 'For sale', hint: 'Land or property listed for purchase' },
  { value: 'both', label: 'Rent & sale', hint: 'Mixed — e.g. plots with some leased' },
];

export function getPropertyTypeLabel(value) {
  const key = String(value || '').toLowerCase();
  return PROPERTY_TYPE_OPTIONS.find((o) => o.value === key)?.label || key.replace(/_/g, ' ');
}

export function getListingIntentLabel(value) {
  const key = String(value || 'rent').toLowerCase();
  return LISTING_INTENT_OPTIONS.find((o) => o.value === key)?.label || key;
}

export function isLandProperty(property) {
  return String(property?.property_type || '').toLowerCase() === 'land';
}

export function isSaleListing(property) {
  const intent = String(property?.listing_intent || property?.stats?.listing_intent || 'rent').toLowerCase();
  return intent === 'sale' || intent === 'both';
}

export function propertyOccupancySummary(property) {
  const stats = property?.stats || property;
  const declared = Number(stats.declared_total_units ?? property?.total_units ?? 0);
  const unitCount = Number(stats.unit_count ?? 0);
  const occupied = Number(stats.occupied_units ?? 0);
  const available = Number(stats.available_units ?? 0);
  const maintenance = Number(stats.maintenance_units ?? 0);
  const rate = Number(stats.occupancy_rate ?? 0);
  const remaining = stats.units_remaining_capacity;

  if (isLandProperty(property)) {
    return {
      headline: property?.lot_size ? `Plot · ${property.lot_size}` : 'Land parcel',
      subline: isSaleListing(property) ? 'Listed for sale' : 'Land holding',
      declared,
      unitCount,
      occupied,
      available,
      maintenance,
      rate,
      remaining,
    };
  }

  const capacityLabel = declared > 0 ? `${unitCount} / ${declared} units registered` : `${unitCount} unit(s) registered`;
  return {
    headline: capacityLabel,
    subline: declared > 0 && remaining != null ? `${remaining} slot(s) left to add` : 'Set declared total to track capacity',
    declared,
    unitCount,
    occupied,
    available,
    maintenance,
    rate,
    remaining,
  };
}

export const emptyPropertyFormState = () => ({
  name: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  country: DEFAULT_RENTAL_COUNTRY,
  property_type: 'house',
  description: '',
  total_units: 1,
  listing_intent: 'rent',
  sale_price: '',
  lot_size: '',
});

export function propertyFormFromRow(property) {
  return {
    name: property.name || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip_code: property.zip_code || '',
    country: property.country || DEFAULT_RENTAL_COUNTRY,
    property_type: property.property_type || 'house',
    description: property.description || '',
    total_units: property.total_units ?? (isLandProperty(property) ? 0 : 1),
    listing_intent: property.listing_intent || 'rent',
    sale_price: property.sale_price != null ? String(property.sale_price) : '',
    lot_size: property.lot_size || '',
  };
}

export function buildPropertyPayload(formData) {
  const land = formData.property_type === 'land';
  const payload = {
    ...formData,
    total_units: land && !formData.total_units ? 0 : parseInt(formData.total_units, 10) || 0,
    sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
    lot_size: formData.lot_size?.trim() || null,
  };
  if (!payload.sale_price && payload.sale_price !== 0) delete payload.sale_price;
  return payload;
}
