import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1';

export const fetchPublicPaymentCheckout = (paymentId) =>
  axios.get(`${API_BASE_URL}/inspection-payments/public/${paymentId}`);

export const confirmPublicPayment = (paymentId, payload) =>
  axios.post(`${API_BASE_URL}/inspection-payments/public/${paymentId}/confirm`, payload);

export const generateBookingPaymentQr = (bookingId, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.post(
    `${API_BASE_URL}/inspection-payments/booking/${bookingId}/generate-qr`,
    {},
    { headers }
  );
};

export const markInspectionPaymentPaid = (paymentId, payload, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.post(
    `${API_BASE_URL}/inspection-payments/${paymentId}/mark-paid`,
    payload,
    { headers }
  );
};

export const fetchInspectionPayments = (token, params = {}) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.get(`${API_BASE_URL}/inspection-payments/`, { headers, params });
};

export const fetchMyInspectionPayments = () =>
  axios.get(`${API_BASE_URL}/inspection-payments/mine`, {
    headers: (() => {
      const t = localStorage.getItem('token');
      return t ? { Authorization: `Bearer ${t}` } : {};
    })(),
  });
