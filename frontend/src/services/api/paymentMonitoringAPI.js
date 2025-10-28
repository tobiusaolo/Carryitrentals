import axios from 'axios';

const API_BASE_URL = '/api/v1';

const paymentMonitoringAPI = {
  // Payment Monitoring
  getPaymentSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/payment-monitoring/summary`);
    return response.data;
  },

  getTenantCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/payment-monitoring/categories`);
    return response.data;
  },

  runManualCheck: async () => {
    const response = await axios.post(`${API_BASE_URL}/payment-monitoring/run-check`);
    return response.data;
  },

  getOverdueTenants: async () => {
    const response = await axios.get(`${API_BASE_URL}/tenants/overdue`);
    return response.data;
  },

  getTenantsByStatus: async (status) => {
    const response = await axios.get(`${API_BASE_URL}/tenants/payment-status?status=${status}`);
    return response.data;
  }
};

export default paymentMonitoringAPI;

