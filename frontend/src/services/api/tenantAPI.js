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
    api.post('/tenants', tenantData),
  
  updateTenant: (tenantId, tenantData) => 
    api.put(`/tenants/${tenantId}`, tenantData),
  
  deleteTenant: (tenantId) => 
    api.delete(`/tenants/${tenantId}`),
  
  updateTenantPaymentStatus: (tenantId, status, paymentDate = null) => {
    const params = new URLSearchParams();
    params.append('status', status);
    if (paymentDate) {
      params.append('payment_date', paymentDate);
    }
    return api.patch(`/tenants/${tenantId}/payment-status?${params.toString()}`);
  },
  
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
    });
  },
  
  searchTenants: (query, skip = 0, limit = 100) => 
    api.get(`/tenants/search/${query}?skip=${skip}&limit=${limit}`),
};
