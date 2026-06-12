/**
 * Client-side GET cache for admin / owner portal navigation.
 * - In-memory store with TTL tiers
 * - sessionStorage persistence (survives refresh within the same tab)
 * - In-flight request de-duplication
 */

export const DEFAULT_TTL = 60 * 1000;
export const SHORT_TTL = 30 * 1000;
export const MEDIUM_TTL = 2 * 60 * 1000;
export const LONG_TTL = 5 * 60 * 1000;

const STORAGE_KEY = 'carryit:api:cache:v1';

const store = new Map();
const inflight = new Map();

/** Never cache these paths (auth, live counters). */
const NEVER_CACHE = ['/auth/refresh', '/auth/login', '/auth/register', '/webhooks', '/health'];

/** Shorter TTL — changes often but cache still helps navigation. */
const SHORT_TTL_PATTERNS = [
  'payment-status',
  'payment_status',
  '/notifications',
  '/overdue',
  '/admin/stats',
  '/analytics/',
  'inspection-bookings',
  'inspection-payments',
  'my-bookings',
];

/** Longer TTL — reference / directory data. */
const LONG_TTL_PATTERNS = [
  '/agents',
  '/payment-methods',
  '/admin/settings',
  '/properties',
  '/additional-services/',
];

export const buildKey = (url, config = {}) => {
  const params = config.params ? JSON.stringify(config.params) : '';
  const paramFromUrl = url.includes('?') ? url.split('?')[1] : '';
  const path = url.split('?')[0];
  return `${path}?${params || paramFromUrl}`;
};

export const getCacheTTL = (url = '') => {
  if (NEVER_CACHE.some((p) => url.includes(p))) return 0;
  if (SHORT_TTL_PATTERNS.some((p) => url.includes(p))) return SHORT_TTL;
  if (LONG_TTL_PATTERNS.some((p) => url.includes(p))) return LONG_TTL;
  return MEDIUM_TTL;
};

export const isCacheable = (url = '', config = {}) => {
  if (config.cache === false) return false;
  if (config.responseType && config.responseType !== 'json') return false;
  if (getCacheTTL(url) === 0) return false;
  return true;
};

const reconstructResponse = (entry, config = {}) => ({
  data: entry.data,
  status: entry.status || 200,
  statusText: 'OK',
  headers: entry.headers || {},
  config: { url: config.url, ...config },
  request: {},
});

function readSessionBag() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSessionBag(bag) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
  } catch {
    // quota exceeded — drop persisted cache
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

function readSessionEntry(key) {
  const bag = readSessionBag();
  const entry = bag[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete bag[key];
    writeSessionBag(bag);
    return null;
  }
  return entry;
}

function writeSessionEntry(key, entry) {
  const bag = readSessionBag();
  bag[key] = entry;
  writeSessionBag(bag);
}

export const getCached = (key) => {
  const entry = store.get(key);
  if (entry) {
    if (Date.now() > entry.expires) {
      store.delete(key);
    } else {
      return reconstructResponse(entry, { url: key.split('?')[0] });
    }
  }

  const persisted = readSessionEntry(key);
  if (!persisted) return null;

  store.set(key, persisted);
  return reconstructResponse(persisted, { url: key.split('?')[0] });
};

export const peekCachedData = (key) => {
  const hit = getCached(key);
  return hit ? hit.data : null;
};

export const setCached = (key, response, ttl = DEFAULT_TTL) => {
  const entry = {
    data: response.data,
    status: response.status,
    headers: response.headers,
    expires: Date.now() + ttl,
  };
  store.set(key, entry);
  writeSessionEntry(key, entry);
};

export const getInflight = (key) => inflight.get(key);

export const setInflight = (key, promise) => {
  inflight.set(key, promise);
  promise.finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
  return promise;
};

export const invalidate = (matcher) => {
  if (!matcher) {
    store.clear();
    inflight.clear();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  const keys = [...store.keys()];
  keys.forEach((key) => {
    const match = typeof matcher === 'string' ? key.includes(matcher) : matcher.test(key);
    if (match) store.delete(key);
  });

  const bag = readSessionBag();
  let changed = false;
  Object.keys(bag).forEach((key) => {
    const match = typeof matcher === 'string' ? key.includes(matcher) : matcher.test(key);
    if (match) {
      delete bag[key];
      changed = true;
    }
  });
  if (changed) writeSessionBag(bag);
};

export const clearCache = () => invalidate();
