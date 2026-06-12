import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PageMetaContext = createContext(null);

export function PageMetaProvider({ children, fallback = {} }) {
  const [meta, setMetaState] = useState(fallback);

  useEffect(() => {
    setMetaState(fallback);
  }, [fallback?.title, fallback?.subtitle, fallback?.meta]);

  const setPageMeta = useCallback((next) => {
    if (!next) {
      setMetaState(fallback);
      return;
    }
    setMetaState(next);
  }, [fallback]);

  const value = useMemo(() => ({ meta, setPageMeta }), [meta, setPageMeta]);

  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMeta() {
  const ctx = useContext(PageMetaContext);
  if (!ctx) {
    throw new Error('usePageMeta must be used within PageMetaProvider');
  }
  return ctx;
}

/** Register title/subtitle in the portal top bar (for pages without PageHeader). */
export function useRegisterPageMeta({ title, subtitle, meta } = {}) {
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    if (title) {
      setPageMeta({ title, subtitle, meta });
    }
  }, [title, subtitle, meta, setPageMeta]);
}
