import api from './api';

export const adminRevenueAPI = {
  getSummary: () => api.get('/admin/revenue'),
};
