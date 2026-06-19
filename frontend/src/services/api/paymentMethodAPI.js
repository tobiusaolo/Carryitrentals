import api from './api';

const paymentMethodAPI = {
  list: (skip = 0, limit = 100) => api.get(`/payment-methods/?skip=${skip}&limit=${limit}`),
  create: (payload) => api.post('/payment-methods/', payload),
  update: (id, payload) => api.put(`/payment-methods/${id}`, payload),
  remove: (id) => api.delete(`/payment-methods/${id}`),
};

export default paymentMethodAPI;
