/** Format amounts for owner dashboard (default UGX). */
export function formatMoney(amount, currency = 'UGX') {
  const n = Number(amount) || 0;
  const code = (currency || 'UGX').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'UGX' ? 0 : 2,
    }).format(n);
  } catch {
    return `${code} ${n.toLocaleString()}`;
  }
}
