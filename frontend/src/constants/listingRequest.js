/** Listing request workflow statuses (owner → admin). */

export const LISTING_REQUEST_STATUSES = {
  pending: {
    label: 'Awaiting review',
    shortLabel: 'Pending',
    description: 'Submitted — waiting for CarryIT admin to pick it up.',
    tone: 'pending',
    step: 1,
  },
  in_review: {
    label: 'In review',
    shortLabel: 'In review',
    description: 'An admin is reviewing your request and preparing the listing.',
    tone: 'warning',
    step: 2,
  },
  fulfilled: {
    label: 'Published',
    shortLabel: 'Live',
    description: 'Your listing has been created and is on CarryIT.',
    tone: 'success',
    step: 3,
  },
  rejected: {
    label: 'Not approved',
    shortLabel: 'Declined',
    description: 'This request was not approved. See admin notes below.',
    tone: 'error',
    step: 3,
  },
};

export function getListingRequestStatusMeta(status) {
  const key = String(status || 'pending').toLowerCase();
  return LISTING_REQUEST_STATUSES[key] || LISTING_REQUEST_STATUSES.pending;
}

export const LISTING_REQUEST_TYPE_LABELS = {
  rental_unit: 'Unit for rent',
  short_stay: 'Short stay',
};
