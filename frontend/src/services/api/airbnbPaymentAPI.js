import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export const fetchAirbnbCheckout = (bookingId) =>
  axios.get(`${API_BASE_URL}/pesapal/airbnb/${bookingId}/checkout`);

export const initiateAirbnbPesapal = (bookingId, billing = {}) =>
  axios.post(`${API_BASE_URL}/pesapal/airbnb/${bookingId}/initiate`, { billing });

export const fetchPesapalOrderStatus = (orderTrackingId) =>
  axios.get(`${API_BASE_URL}/pesapal/orders/${orderTrackingId}/status`);
