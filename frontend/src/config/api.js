/** Production API fallback (used only in production builds). */
export const DEPLOYED_API_BASE_URL = 'https://carryit-backend-su8h.onrender.com/api/v1';

/** Local backend for development. */
export const LOCAL_API_BASE_URL = 'https://carryit-backend-su8h.onrender.com/api/v1';

/** Normalize API URL — Render requires HTTPS; trailing slashes on base are stripped. */
export function normalizeApiBaseUrl(url) {
  let base = String(url || '').trim();
  if (!base) {
    base = DEPLOYED_API_BASE_URL;
  }
  if (base.startsWith('http://') && base.includes('onrender.com')) {
    base = base.replace('http://', 'https://');
  }
  return base.replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  return normalizeApiBaseUrl(process.env.REACT_APP_API_URL || DEPLOYED_API_BASE_URL);
}

/** Shared API base URL — keep public pages and owner portal on the same backend. */
export const API_BASE_URL = resolveApiBaseUrl();

export function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
}

/** Turn stored upload paths into browser-loadable URLs. */
export function resolveMediaUrl(path) {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${getApiOrigin()}${trimmed}`;
  }
  return `${getApiOrigin()}/uploads/unit_images/${trimmed}`;
}
