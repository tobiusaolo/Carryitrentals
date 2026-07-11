import { invalidate } from '../services/apiCache';

export const ADMIN_REFRESH_EVENT = 'carryit:admin-refresh';

/** Invalidate API cache and notify admin pages to reload data. */
export function triggerAdminRefresh() {
  invalidate(() => true);
  window.dispatchEvent(new CustomEvent(ADMIN_REFRESH_EVENT));
}
