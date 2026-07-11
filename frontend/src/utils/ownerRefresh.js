import { invalidate } from '../services/apiCache';

export const OWNER_REFRESH_EVENT = 'carryit:owner-refresh';
export const ADMIN_REFRESH_EVENT = 'carryit:admin-refresh';

/** Invalidate API cache and notify owner pages to reload data. */
export function triggerOwnerRefresh() {
  invalidate(() => true);
  window.dispatchEvent(new CustomEvent(OWNER_REFRESH_EVENT));
  window.dispatchEvent(new CustomEvent(ADMIN_REFRESH_EVENT));
}
