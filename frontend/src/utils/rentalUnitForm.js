import {
  IMAGE_SEPARATOR,
  MIN_RENTAL_LISTING_IMAGES,
  normalizeUnitType,
  parseAgentId,
  isCommercialUnit,
} from '../constants/rentalUnit';

export { MIN_RENTAL_LISTING_IMAGES };

export function splitListingImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === 'string') {
    return images.split(IMAGE_SEPARATOR).filter((img) => img.trim());
  }
  return [];
}

/** Local server upload paths break after cloud deploy — must be re-uploaded to R2. */
export function isLegacyLocalUploadUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.includes('/uploads/unit_images/')) return false;
  if (trimmed.includes('r2.dev') || trimmed.includes('r2.cloudflarestorage.com')) return false;
  return true;
}

export function filterPersistedListingImages(images) {
  return splitListingImages(images).filter((img) => !isLegacyLocalUploadUrl(img));
}

export function countListingImages(unitOrImages) {
  if (unitOrImages && typeof unitOrImages === 'object' && !Array.isArray(unitOrImages)) {
    return splitListingImages(unitOrImages.images).length;
  }
  return splitListingImages(unitOrImages).length;
}

/** Owner dashboard: fewer than 5 photos — not shown on public marketplace. */
export function isListingDraft(unit) {
  return countListingImages(unit) < MIN_RENTAL_LISTING_IMAGES;
}

/** Ready for public browse (photos + available or taken status). */
export function isListingPublished(unit) {
  if (isListingDraft(unit)) return false;
  const status = String(unit?.status || 'available').toLowerCase();
  return status === 'available' || status === 'occupied';
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Convert File + existing base64 strings to a single images payload field. */
export async function imagesPayloadFromSelection(selectedImages) {
  const base64Images = [];
  for (const item of selectedImages) {
    if (typeof item === 'string' && item.trim()) {
      if (isLegacyLocalUploadUrl(item)) continue;
      base64Images.push(item.trim());
    } else if (item instanceof File || item instanceof Blob) {
      base64Images.push(await fileToBase64(item));
    }
  }
  return base64Images.length > 0 ? base64Images.join(IMAGE_SEPARATOR) : null;
}

/**
 * Build API payload for POST/PUT /rental-units (aligned across admin, owner, agent).
 */
export function buildRentalUnitPayload(formData, { images = null, includeAgentId = true } = {}) {
  const commercial = isCommercialUnit(formData.unit_type);
  const rent = parseFloat(formData.monthly_rent);

  const payload = {
    property_id: formData.property_id || null,
    internal_unit_id: formData.internal_unit_id || null,
    title: formData.title?.trim(),
    location: formData.location?.trim(),
    country: formData.country || 'Uganda',
    unit_type: normalizeUnitType(formData.unit_type),
    floor: formData.floor !== '' && formData.floor != null ? parseInt(formData.floor, 10) : null,
    bedrooms: commercial
      ? null
      : (formData.bedrooms !== '' && formData.bedrooms != null ? parseInt(formData.bedrooms, 10) : 0),
    bathrooms: commercial
      ? null
      : (formData.bathrooms !== '' && formData.bathrooms != null ? parseInt(formData.bathrooms, 10) : 0),
    square_feet: commercial && formData.square_feet ? parseFloat(formData.square_feet) : null,
    monthly_rent: Number.isFinite(rent) ? rent : 0,
    currency: formData.currency || 'UGX',
    status: formData.status || 'available',
    description: formData.description || null,
    amenities: formData.amenities || null,
    is_furnished: Boolean(formData.is_furnished),
    images,
  };

  if (includeAgentId) {
    payload.agent_id = parseAgentId(formData.agent_id);
  }

  return payload;
}

/** Turn FastAPI / axios errors into a user-visible string. */
export function formatRentalApiError(err, fallback = 'Failed to save listing') {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return err?.message || fallback;
}

export function rentalFormFromUnit(unit) {
  return {
    property_id: unit.property_id || '',
    internal_unit_id: unit.internal_unit_id || '',
    title: unit.title || '',
    location: unit.location || '',
    country: unit.country || 'Uganda',
    unit_type: normalizeUnitType(unit.unit_type),
    floor: unit.floor ?? '',
    bedrooms: unit.bedrooms ?? '',
    bathrooms: unit.bathrooms ?? '',
    square_feet: unit.square_feet ?? '',
    monthly_rent: unit.monthly_rent ?? '',
    currency: unit.currency || 'UGX',
    status: typeof unit.status === 'object' && unit.status?.value ? unit.status.value : (unit.status || 'available'),
    description: unit.description || '',
    amenities: unit.amenities || '',
    is_furnished: Boolean(unit.is_furnished),
    images: unit.images || '',
    agent_id: unit.agent_id != null ? String(unit.agent_id) : '',
    video_url: unit.video_url || '',
  };
}

export function matchesRentalCategory(unit, categoryLabel) {
  if (!categoryLabel || categoryLabel === 'All Units') return true;
  const type = normalizeUnitType(unit.unit_type);
  const cat = categoryLabel.toLowerCase();

  if (cat === 'apartments') {
    return ['one_bedroom', 'two_bedroom', 'three_bedroom', 'studio', 'single', 'double'].includes(type);
  }
  if (cat === 'one bedroom') return (unit.bedrooms || 0) === 1;
  if (cat === 'two bedroom') return (unit.bedrooms || 0) === 2;
  if (cat === 'villas') return ['penthouse', 'semi_detached'].includes(type);
  if (cat === 'furnished') {
    if (unit.is_furnished === true) return true;
    const text = `${unit.amenities || ''} ${unit.description || ''}`.toLowerCase();
    return text.includes('furnished');
  }
  return true;
}
