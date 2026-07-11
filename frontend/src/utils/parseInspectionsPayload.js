/**
 * Normalizes inspection booking list responses from varied API shapes.
 */
export function parseInspectionsPayload(responseData) {
  let inspectionsData = [];
  let total = 0;

  if (responseData && typeof responseData === 'object') {
    if (Array.isArray(responseData)) {
      inspectionsData = responseData;
      total = responseData.length;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      inspectionsData = responseData.items;
      total = responseData.total || responseData.items.length;
    } else if (responseData.bookings && Array.isArray(responseData.bookings)) {
      inspectionsData = responseData.bookings;
      total = responseData.total || responseData.bookings.length;
    } else {
      const keys = Object.keys(responseData);
      for (const key of keys) {
        if (Array.isArray(responseData[key])) {
          inspectionsData = responseData[key];
          total = responseData.total || responseData[key].length;
          break;
        }
      }
    }
  }

  return { items: inspectionsData, total };
}
