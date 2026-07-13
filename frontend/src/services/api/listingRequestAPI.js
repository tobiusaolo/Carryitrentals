import authService from '../authService';
import { API_BASE_URL } from '../../config/api';

function formatListingRequestError(err) {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;

  if (status === 404) {
    return (
      `Listing requests API was not found (${API_BASE_URL}). ` +
      'Check that REACT_APP_API_URL points to https://carryit-backend-su8h.onrender.com/api/v1'
    );
  }
  if (status === 402) {
    return typeof detail === 'string'
      ? detail
      : 'An active subscription is required. Open Billing to renew your plan.';
  }
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
  }
  return err?.message || 'Failed to submit request. Try again.';
}

export const listingRequestAPI = {
  async submit(data) {
    try {
      return await authService.post('/listing-requests/', data);
    } catch (err) {
      const wrapped = new Error(formatListingRequestError(err));
      wrapped.cause = err;
      wrapped.response = err?.response;
      throw wrapped;
    }
  },
  getMine: () => authService.get('/listing-requests/me', { cache: false }),
  getAll: (params = {}) => authService.get('/listing-requests/', { params, cache: false }),
  getById: (id) => authService.get(`/listing-requests/${id}`, { cache: false }),
  update: (id, data) => authService.patch(`/listing-requests/${id}`, data),
  uploadVideo: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return authService.post(`/listing-requests/${id}/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },
};

/** Safe load for owner pages — never throws on 404/403 (e.g. stale backend or admin session). */
export async function fetchMyListingRequests(requestType) {
  try {
    const res = await listingRequestAPI.getMine();
    const rows = res.data || [];
    return requestType ? rows.filter((r) => r.request_type === requestType) : rows;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 403 || status === 500) {
      return [];
    }
    throw err;
  }
}
