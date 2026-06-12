/** Normalize API URL — Render requires HTTPS; trailing slashes on base are stripped. */
export function normalizeApiBaseUrl(url) {
  let base = String(url || '').trim();
  if (!base) {
    base = 'https://carryit-backend-su8h.onrender.com/api/v1';
  }
  if (base.startsWith('http://') && base.includes('onrender.com')) {
    base = base.replace('http://', 'https://');
  }
  return base.replace(/\/+$/, '');
}

/** Shared API base URL — keep public pages and owner portal on the same backend. */
export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1'
);

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
