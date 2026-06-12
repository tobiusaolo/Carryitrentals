import axios from 'axios';
import { API_BASE_URL, resolveMediaUrl } from '../../config/api';

export const reportListing = (payload) =>
  axios.post(`${API_BASE_URL}/marketplace/listing-reports`, payload);

export const requestProperty = (payload) =>
  axios.post(`${API_BASE_URL}/marketplace/property-requests`, payload);

export const fetchPublicRentals = (params = {}) =>
  axios.get(`${API_BASE_URL}/rental-units/public`, { params });

export const fetchPublicRentalById = (id) =>
  axios.get(`${API_BASE_URL}/rental-units/public/${id}`);

export const normalizePublicRentalUnit = (unit) => {
  const copy = { ...unit };
  if (copy.images && typeof copy.images === 'string') {
    copy.images = copy.images
      .split('|||IMAGE_SEPARATOR|||')
      .filter((img) => img.trim())
      .map((img) => resolveMediaUrl(img.trim()));
  } else if (Array.isArray(copy.images)) {
    copy.images = copy.images.filter(Boolean).map((img) => resolveMediaUrl(img));
  } else {
    copy.images = [];
  }
  return copy;
};
