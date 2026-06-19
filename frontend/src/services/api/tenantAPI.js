import api from './api';

export const tenantAPI = {
  getAllTenants: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/tenants?${params.toString()}`);
  },
  
  getTenantById: (tenantId) => 
    api.get(`/tenants/${tenantId}`),
  
  createTenant: (tenantData) => 
    api.post('/tenants', tenantData, { timeout: 120000 }), // 2 minutes for complex operations
  
  updateTenant: (tenantId, tenantData) => 
    api.put(`/tenants/${tenantId}`, tenantData),
  
  deleteTenant: (tenantId) => 
    api.delete(`/tenants/${tenantId}`),
  
  updateTenantPaymentStatus: (tenantId, status, paymentDate = null, amount = null) =>
    api.patch(`/tenants/${tenantId}/update-payment-status`, {
      payment_status: status,
      last_payment_date: paymentDate,
      amount,
    }),
  
  moveOutTenant: (tenantId, moveOutDate) => 
    api.patch(`/tenants/${tenantId}/move-out`, { move_out_date: moveOutDate }),
  
  getOverdueTenants: () => 
    api.get('/tenants/overdue'),
  
  getTenantsPaymentStatus: (propertyId = null) => {
    const params = new URLSearchParams();
    if (propertyId) {
      params.append('property_id', propertyId);
    }
    return api.get(`/tenants/payment-status?${params.toString()}`);
  },
  
  uploadNationalIdImages: (tenantId, frontImage, backImage) => {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);
    return api.post(`/tenants/${tenantId}/upload-national-id`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutes for image uploads
    });
  },
  
  searchTenants: (query, skip = 0, limit = 100) => 
    api.get(`/tenants/search/${query}?skip=${skip}&limit=${limit}`),

  getChatMessages: (tenantId) =>
    api.get(`/tenants/${tenantId}/chat`),

  sendChatMessage: (tenantId, message) =>
    api.post(`/tenants/${tenantId}/chat`, { message }),

  getLeaseRecord: (tenantId) =>
    api.get(`/tenants/${tenantId}/lease`),

  uploadLeaseDocument: (tenantId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tenants/${tenantId}/upload-lease-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
  },

  getPendingScreening: () => api.get('/tenants/screening/pending'),

  reviewScreening: (tenantId, status, notes) =>
    api.post(`/tenants/${tenantId}/screening/review`, { status, notes }),
};
