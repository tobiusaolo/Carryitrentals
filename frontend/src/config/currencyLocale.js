/**
 * East Africa focus: rates express local amount ≈ UGX × rate (same model as Guidelines page).
 * Update periodically for production; suitable for display (not financial settlement).
 */
export const RATES_FROM_UGX = {
  UGX: 1,
  KES: 0.033,
  TZS: 0.043,
  RWF: 0.036,
  BIF: 0.54,
  SSP: 0.14,
  USD: 0.00027,
  EUR: 0.00025,
  GBP: 0.00021,
  ZAR: 0.0048,
  NGN: 0.00042,
};

export const VIEWER_REGIONS = [
  { code: 'UG', country: 'Uganda', currency: 'UGX', flag: '🇺🇬', timezones: ['Africa/Kampala'] },
  { code: 'KE', country: 'Kenya', currency: 'KES', flag: '🇰🇪', timezones: ['Africa/Nairobi'] },
  { code: 'TZ', country: 'Tanzania', currency: 'TZS', flag: '🇹🇿', timezones: ['Africa/Dar_es_Salaam'] },
  { code: 'RW', country: 'Rwanda', currency: 'RWF', flag: '🇷🇼', timezones: ['Africa/Kigali'] },
  { code: 'BI', country: 'Burundi', currency: 'BIF', flag: '🇧🇮', timezones: ['Africa/Bujumbura'] },
  { code: 'SS', country: 'South Sudan', currency: 'SSP', flag: '🇸🇸', timezones: ['Africa/Juba'] },
  { code: 'US', country: 'United States', currency: 'USD', flag: '🇺🇸', timezones: ['America/New_York', 'America/Chicago', 'America/Los_Angeles'] },
  { code: 'GB', country: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', timezones: ['Europe/London'] },
];

const LOCALE_COUNTRY_MAP = {
  UG: 'Uganda',
  KE: 'Kenya',
  TZ: 'Tanzania',
  RW: 'Rwanda',
  BI: 'Burundi',
  SS: 'South Sudan',
  US: 'United States',
  GB: 'United Kingdom',
};

export const STORAGE_KEY_COUNTRY = 'carryit_viewer_country';

export const normalizeCurrency = (currency) => {
  if (!currency) return 'UGX';
  const raw = String(currency).replace('Currency.', '').trim().toUpperCase();
  return RATES_FROM_UGX[raw] !== undefined ? raw : 'UGX';
};

export const getCurrencyForCountry = (countryName) => {
  const region = VIEWER_REGIONS.find((r) => r.country === countryName);
  return region?.currency || 'UGX';
};

export const getCountryForCode = (code) =>
  VIEWER_REGIONS.find((r) => r.code === code)?.country || 'Uganda';

export const convertAmount = (amount, fromCurrency, toCurrency) => {
  const value = parseFloat(amount);
  if (!value || Number.isNaN(value)) return 0;

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  if (from === to) return Math.round(value);

  const fromRate = RATES_FROM_UGX[from] || 1;
  const toRate = RATES_FROM_UGX[to] || 1;
  const ugx = from === 'UGX' ? value : value / fromRate;
  return Math.round(ugx * toRate);
};

export const formatAmount = (amount, currency) => {
  const code = normalizeCurrency(currency);
  const n = Math.round(parseFloat(amount) || 0);
  return `${code} ${n.toLocaleString()}`;
};

export const detectCountryFromEnvironment = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COUNTRY);
    if (saved && VIEWER_REGIONS.some((r) => r.country === saved)) {
      return { country: saved, source: 'saved' };
    }
  } catch {
    /* ignore */
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const byTz = VIEWER_REGIONS.find((r) => r.timezones.includes(tz));
    if (byTz) return { country: byTz.country, source: 'timezone' };
  } catch {
    /* ignore */
  }

  try {
    const lang = navigator.language || '';
    const part = lang.split('-')[1]?.toUpperCase();
    if (part && LOCALE_COUNTRY_MAP[part]) {
      return { country: LOCALE_COUNTRY_MAP[part], source: 'locale' };
    }
  } catch {
    /* ignore */
  }

  return { country: 'Uganda', source: 'default' };
};

export const detectCountryFromIP = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const match = VIEWER_REGIONS.find((r) => r.code === data.country_code);
    if (match) return { country: match.country, source: 'ip' };
    if (data.country_name) {
      const byName = VIEWER_REGIONS.find(
        (r) => r.country.toLowerCase() === String(data.country_name).toLowerCase()
      );
      if (byName) return { country: byName.country, source: 'ip' };
    }
  } catch {
    /* ignore */
  }
  return null;
};
