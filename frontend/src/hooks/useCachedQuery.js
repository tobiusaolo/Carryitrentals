import { useCallback, useEffect, useRef, useState } from 'react';
import authService from '../services/authService';
import { buildKey, peekCachedData } from '../services/apiCache';

/**
 * Cached GET for admin / owner screens.
 * Shows cached data immediately; refreshes in the background when stale.
 *
 * @param {string} url - API path, e.g. '/agents/'
 * @param {object} [options]
 * @param {object} [options.config] - axios config (params, cacheTTL, etc.)
 * @param {boolean} [options.enabled=true]
 * @param {Array} [options.deps=[]]
 * @param {(raw: *) => *} [options.select] - transform API payload before storing in state
 */
export function useCachedQuery(url, { config = {}, enabled = true, deps = [], select } = {}) {
  const key = buildKey(url, config);
  const peekRaw = enabled ? peekCachedData(key) : null;
  const initial = peekRaw != null && select ? select(peekRaw) : peekRaw;

  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled && initial == null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const run = useCallback(
    async (isRefresh = false) => {
      if (!enabled || !url) return;

      const cachedRaw = peekCachedData(key);
      const cached = cachedRaw != null && select ? select(cachedRaw) : cachedRaw;
      if (cached != null && !isRefresh) {
        setData(cached);
        setLoading(false);
      } else if (!cached && !isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);
      try {
        const response = await authService.get(url, {
          ...config,
          forceRefresh: isRefresh,
        });
        if (!mounted.current) return;
        setData(select ? select(response.data) : response.data);
      } catch (err) {
        if (!mounted.current) return;
        if (cached == null && peekCachedData(key) == null) {
          setError(err.response?.data?.detail || err.message || 'Could not load data');
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, key, enabled, ...deps]
  );

  useEffect(() => {
    mounted.current = true;
    run(false);
    return () => {
      mounted.current = false;
    };
  }, [run]);

  const refresh = useCallback(() => run(true), [run]);

  return { data: data ?? undefined, loading, refreshing, error, refresh, setData };
}

function resolveQuerySlot(raw, query) {
  if (raw == null) return undefined;
  return query?.select ? query.select(raw) : raw;
}

/**
 * Parallel cached queries (e.g. dashboard loads multiple endpoints).
 * Each query may define `select` to transform the payload (same as useCachedQuery).
 */
export function useCachedQueries(queries, { enabled = true, deps = [] } = {}) {
  const peekAll = () =>
    queries.map((q) =>
      enabled ? resolveQuerySlot(peekCachedData(buildKey(q.url, q.config)), q) : undefined
    );

  const [data, setData] = useState(peekAll);
  const [loading, setLoading] = useState(
    enabled && peekAll().some((slot) => slot === undefined)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (isRefresh = false) => {
      if (!enabled) return;

      const peeked = peekAll();
      if (peeked.some((p) => p !== undefined) && !isRefresh) {
        setData(peeked);
        setLoading(false);
      } else if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);
      try {
        const results = await Promise.all(
          queries.map((q) =>
            authService.get(q.url, { ...q.config, forceRefresh: isRefresh }).then((r) => r.data)
          )
        );
        setData(results.map((r, i) => resolveQuerySlot(r, queries[i])));
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Could not load data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, ...deps]
  );

  useEffect(() => {
    run(false);
  }, [run]);

  return { data, loading, refreshing, error, refresh: () => run(true) };
}

export default useCachedQuery;
