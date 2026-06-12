/** Property (building) types — matches backend PropertyType enum */

import { COUNTRY_OPTIONS, DEFAULT_RENTAL_COUNTRY } from './rentalUnit';

export { COUNTRY_OPTIONS, DEFAULT_RENTAL_COUNTRY };

export const PROPERTY_TYPE_OPTIONS = [
  {
    value: 'house',
    label: 'House',
    hint: 'Standalone home (villa, bungalow, detached)',
  },
  {
    value: 'apartment',
    label: 'Apartment building',
    hint: 'Multi-unit building you manage as one property',
  },
  {
    value: 'condo',
    label: 'Condominium',
    hint: 'Owned units in a shared building',
  },
  {
    value: 'townhouse',
    label: 'Townhouse',
    hint: 'Row or terrace homes',
  },
  {
    value: 'multi_family',
    label: 'Multi-Family Residential',
    hint: 'Duplexes, triplexes, or fourplexes',
  },
  {
    value: 'commercial',
    label: 'Commercial Space',
    hint: 'General purpose commercial real estate',
  },
  {
    value: 'office',
    label: 'Office Building',
    hint: 'Professional suites or corporate buildings',
  },
  {
    value: 'retail',
    label: 'Retail Storefront',
    hint: 'Shopping centers or standalone shops',
  },
  {
    value: 'warehouse',
    label: 'Warehouse / Industrial',
    hint: 'Storage, distribution, or manufacturing facilities',
  },
];

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
});
