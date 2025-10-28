import api from './api';

export const paymentAPI = {
  getAllPayments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/payments?${params.toString()}`);
  },
  
  getPaymentById: (paymentId) => 
    api.get(`/payments/${paymentId}`),
  
  createPayment: (paymentData) => 
    api.post('/payments', paymentData),
  
  updatePayment: (paymentId, paymentData) => 
    api.put(`/payments/${paymentId}`, paymentData),
  
  markPaymentAsPaid: (paymentId) => 
    api.post(`/payments/${paymentId}/mark-paid`),
  
  deletePayment: (paymentId) => 
    api.delete(`/payments/${paymentId}`),
  
  getPaymentsByUnit: (unitId) => 
    api.get(`/payments?unit_id=${unitId}`),
  
  getPaymentsByTenant: (tenantId) => 
    api.get(`/payments?payer_id=${tenantId}`),
  
  getPaymentsByStatus: (status) => 
    api.get(`/payments?status=${status}`),
  
  getOverduePayments: () => 
    api.get('/payments?status=overdue'),
  
  // Utility payment specific methods
  getUtilityPayments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/payments/utilities?${params.toString()}`);
  },
  
  createUtilityPayment: (paymentData) => 
    api.post('/payments/utilities', paymentData),
  
  getUtilityPaymentSummary: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/payments/utilities/summary?${params.toString()}`);
  },
  
  getUtilityPaymentsByProperty: (propertyId) => 
    api.get(`/payments/utilities?property_id=${propertyId}`),
  
  getUtilityPaymentsByUnit: (unitId) => 
    api.get(`/payments/utilities?unit_id=${unitId}`),
  
  getUtilityPaymentsByTenant: (tenantId) => 
    api.get(`/payments/utilities?tenant_id=${tenantId}`)
};
