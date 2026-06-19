import api from './api';

export const leaseInspectionAPI = {
  listForTenant: (tenantId) => api.get(`/lease-inspections/tenant/${tenantId}`),
  get: (inspectionId) => api.get(`/lease-inspections/${inspectionId}`),
  create: (payload) => api.post('/lease-inspections/', payload),
  update: (inspectionId, payload) => api.put(`/lease-inspections/${inspectionId}`, payload),
  uploadPhotos: (inspectionId, files, labels = '') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (labels) formData.append('labels', labels);
    return api.post(`/lease-inspections/${inspectionId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
  },
  submit: (inspectionId) => api.post(`/lease-inspections/${inspectionId}/submit`),
  acknowledge: (inspectionId) => api.post(`/lease-inspections/${inspectionId}/acknowledge`),
};
