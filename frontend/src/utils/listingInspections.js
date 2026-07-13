/** Normalized inspection booking count for a rental listing. */
export function getInspectionBookingsCount(unit) {
  const raw = unit?.inspection_bookings_count;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

/** Human-readable label for viewing / inspection requests. */
export function formatInspectionBookingsLabel(unit) {
  const count = getInspectionBookingsCount(unit);
  if (count === 1) return '1 viewing request';
  return `${count} viewing requests`;
}
