/** Skip redundant Redux fetches when data was loaded recently. */
export const PORTAL_STALE_MS = 2 * 60 * 1000;

export function shouldSkipPortalFetch(lastFetchedAt, force) {
  if (force) return false;
  if (!lastFetchedAt) return false;
  return Date.now() - lastFetchedAt < PORTAL_STALE_MS;
}
