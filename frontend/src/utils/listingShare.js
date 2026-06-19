/**
 * Listing share & syndication copy for WhatsApp, Jiji, Facebook.
 */

export function getListingPublicUrl(unit, baseUrl) {
  const origin =
    baseUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.REACT_APP_PUBLIC_URL ||
    'https://carryit.app';
  const id = unit?.id ?? unit?.rental_unit_id;
  return `${origin.replace(/\/$/, '')}/rentals/${id}`;
}

export function formatListingPrice(unit) {
  if (unit?.monthly_rent == null) return '';
  const currency = unit.currency || 'UGX';
  const amount = Number(unit.monthly_rent).toLocaleString();
  return `${currency} ${amount}/month`;
}

export function formatWhatsAppShareMessage(unit, baseUrl) {
  const title = unit?.title || unit?.name || 'Rental on CarryIT';
  const location = unit?.location || unit?.country || 'Uganda';
  const price = formatListingPrice(unit);
  const code = unit?.listing_code ? `\nRef: ${unit.listing_code}` : '';
  const url = getListingPublicUrl(unit, baseUrl);
  const verified = unit?.carryit_verified || unit?.is_verified ? '\n✅ CarryIT Verified listing' : '';
  return (
    `🏠 ${title}\n` +
    `📍 ${location}` +
    (price ? `\n💰 ${price}` : '') +
    code +
    verified +
    `\n\nBook a viewing on CarryIT (pay before you visit):\n${url}`
  );
}

export function openWhatsAppShare(unit, baseUrl) {
  const text = encodeURIComponent(formatWhatsAppShareMessage(unit, baseUrl));
  if (typeof window !== 'undefined') {
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }
  return formatWhatsAppShareMessage(unit, baseUrl);
}

export function formatSyndicationCopy(unit, platform = 'jiji', baseUrl) {
  const title = unit?.title || unit?.name || 'Property for rent';
  const location = unit?.location || 'Uganda';
  const price = formatListingPrice(unit);
  const beds = unit?.bedrooms != null ? `${unit.bedrooms} bed` : null;
  const baths = unit?.bathrooms != null ? `${unit.bathrooms} bath` : null;
  const specs = [beds, baths, unit?.unit_type?.replace?.(/_/g, ' ') || unit?.unit_type]
    .filter(Boolean)
    .join(' · ');
  const code = unit?.listing_code ? `Listing ref: ${unit.listing_code}\n` : '';
  const url = getListingPublicUrl(unit, baseUrl);
  const verified =
    unit?.carryit_verified || unit?.is_verified
      ? 'CarryIT Verified — book viewing online before you pay anyone.\n'
      : 'Book viewing on CarryIT before you pay anyone.\n';

  const body = [
    title,
    '',
    specs ? `${specs}` : null,
    location,
    price ? `Rent: ${price}` : null,
    unit?.description ? `\n${String(unit.description).slice(0, 400)}` : null,
    '',
    verified,
    code,
    `View & book viewing: ${url}`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  if (platform === 'facebook') {
    return `${body}\n\n#Rent #Uganda #CarryIT #ApartmentForRent`;
  }
  return body;
}

export async function copySyndicationAd(unit, platform = 'jiji', baseUrl) {
  const text = formatSyndicationCopy(unit, platform, baseUrl);
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
  return text;
}

export async function copyListingUrl(unit, baseUrl) {
  const url = getListingPublicUrl(unit, baseUrl);
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
