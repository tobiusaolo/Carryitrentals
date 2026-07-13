import { normalizeRentalStatus } from './rentalStatus';

/** Days a listing has been on the market (available only). */
export function getListingAvailabilityMeta(unit) {
  if (!unit) return null;

  const status = normalizeRentalStatus(unit.status);
  if (status !== 'available') return null;

  const raw = unit.created_at || unit.listed_at;
  if (!raw) return null;

  const listedOn = new Date(raw);
  if (Number.isNaN(listedOn.getTime())) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysAvailable = Math.max(0, Math.floor((Date.now() - listedOn.getTime()) / msPerDay));

  const listedOnLabel = listedOn.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const daysLabel =
    daysAvailable === 0
      ? 'Listed today'
      : daysAvailable === 1
        ? '1 day available'
        : `${daysAvailable} days available`;

  return {
    listedOn,
    daysAvailable,
    listedOnLabel,
    daysLabel,
    summary: `Listed ${listedOnLabel} · ${daysLabel}`,
  };
}
