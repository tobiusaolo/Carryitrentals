const STORAGE_KEY = 'carryit_saved_listings';

export const getSavedListingIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isListingSaved = (id) => getSavedListingIds().includes(String(id));

export const toggleSavedListing = (id) => {
  const sid = String(id);
  const ids = getSavedListingIds();
  const next = ids.includes(sid) ? ids.filter((x) => x !== sid) : [...ids, sid];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.includes(sid);
};
