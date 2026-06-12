import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEY_COUNTRY,
  VIEWER_REGIONS,
  convertAmount,
  detectCountryFromEnvironment,
  detectCountryFromIP,
  formatAmount,
  getCurrencyForCountry,
  normalizeCurrency,
} from '../config/currencyLocale';

const ViewerCurrencyContext = createContext(null);

export const ViewerCurrencyProvider = ({ children }) => {
  const [viewerCountry, setViewerCountry] = useState('Uganda');
  const [detectionSource, setDetectionSource] = useState('default');
  const [detecting, setDetecting] = useState(true);

  const displayCurrency = useMemo(
    () => getCurrencyForCountry(viewerCountry),
    [viewerCountry]
  );

  useEffect(() => {
    const env = detectCountryFromEnvironment();
    setViewerCountry(env.country);
    setDetectionSource(env.source);
    setDetecting(false);

    if (env.source === 'saved') return;

    detectCountryFromIP().then((ipResult) => {
      if (ipResult?.country) {
        setViewerCountry(ipResult.country);
        setDetectionSource(ipResult.source);
        try {
          localStorage.setItem(STORAGE_KEY_COUNTRY, ipResult.country);
        } catch {
          /* ignore */
        }
      }
    });
  }, []);

  const setCountry = useCallback((country) => {
    setViewerCountry(country);
    setDetectionSource('manual');
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, country);
    } catch {
      /* ignore */
    }
  }, []);

  const formatMoney = useCallback(
    (amount, listingCurrency, options = {}) => {
      const from = normalizeCurrency(listingCurrency || 'UGX');
      const to = displayCurrency;
      const converted = convertAmount(amount, from, to);
      const primary = formatAmount(converted, to);
      const sameCurrency = from === to;

      return {
        primary,
        converted,
        displayCurrency: to,
        listingCurrency: from,
        sameCurrency,
        secondary: sameCurrency || options.hideSecondary
          ? null
          : formatAmount(parseFloat(amount) || 0, from),
      };
    },
    [displayCurrency]
  );

  const value = useMemo(
    () => ({
      viewerCountry,
      displayCurrency,
      detectionSource,
      detecting,
      regions: VIEWER_REGIONS,
      setCountry,
      formatMoney,
      convertAmount,
      normalizeCurrency,
    }),
    [viewerCountry, displayCurrency, detectionSource, detecting, setCountry, formatMoney]
  );

  return (
    <ViewerCurrencyContext.Provider value={value}>
      {children}
    </ViewerCurrencyContext.Provider>
  );
};

export const useViewerCurrency = () => {
  const ctx = useContext(ViewerCurrencyContext);
  if (!ctx) {
    throw new Error('useViewerCurrency must be used within ViewerCurrencyProvider');
  }
  return ctx;
};

/** Safe hook for components that may render outside provider (returns passthrough). */
export const useViewerCurrencyOptional = () => {
  const ctx = useContext(ViewerCurrencyContext);
  if (!ctx) {
    return {
      viewerCountry: 'Uganda',
      displayCurrency: 'UGX',
      formatMoney: (amount, listingCurrency) => ({
        primary: formatAmount(amount, listingCurrency || 'UGX'),
        secondary: null,
        sameCurrency: true,
      }),
    };
  }
  return ctx;
};
