import api from './api';

export const fetchPesapalOrderStatus = (orderTrackingId) =>
  api.get(`/pesapal/orders/${orderTrackingId}/status`);

export const initiatePesapalRent = (payload) =>
  api.post('/pesapal/rent/initiate', payload);
