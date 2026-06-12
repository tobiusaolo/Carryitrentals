/** Normalize rental unit status from API (string or { value }). */
export function normalizeRentalStatus(status) {
  if (!status) return 'available';
  if (typeof status === 'object' && status.value) return String(status.value).toLowerCase();
  return String(status).toLowerCase();
}

export const RENTAL_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Taken' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'renovation', label: 'Renovation' },
];

/** Labels and colors for public listing cards. */
export function getRentalStatusMeta(status) {
  const key = normalizeRentalStatus(status);
  switch (key) {
    case 'available':
      return {
        key,
        label: 'Available',
        chipColor: '#0d7a4a',
        chipBg: '#e8f5ee',
        isAvailable: true,
        showOnPublic: true,
      };
    case 'occupied':
      return {
        key,
        label: 'Taken',
        chipColor: '#6b2d2d',
        chipBg: '#fce8e8',
        isAvailable: false,
        showOnPublic: true,
      };
    case 'maintenance':
      return {
        key,
        label: 'Maintenance',
        chipColor: '#8a6116',
        chipBg: '#fff4e0',
        isAvailable: false,
        showOnPublic: false,
      };
    case 'renovation':
      return {
        key,
        label: 'Renovation',
        chipColor: '#5c5c5c',
        chipBg: '#f0f0f0',
        isAvailable: false,
        showOnPublic: false,
      };
    default:
      return {
        key,
        label: key,
        chipColor: '#5c5c5c',
        chipBg: '#f0f0f0',
        isAvailable: false,
        showOnPublic: false,
      };
  }
}

export function sortUnitsAvailableFirst(units) {
  return [...units].sort((a, b) => {
    const aAvail = getRentalStatusMeta(a.status).isAvailable ? 0 : 1;
    const bAvail = getRentalStatusMeta(b.status).isAvailable ? 0 : 1;
    return aAvail - bAvail;
  });
}
