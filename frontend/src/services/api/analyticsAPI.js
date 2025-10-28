import api from './api';

export const analyticsAPI = {
  getDashboardData: () => 
    api.get('/analytics/dashboard-summary'),
  
  getPropertyAnalytics: (propertyId) => 
    api.get(`/analytics/property/${propertyId}`),
  
  getRentalStats: (type, id) => 
    api.get(`/rental-stats/${type}/${id}`),
  
  getOccupancyAnalytics: (propertyId = null) => {
    const url = propertyId 
      ? `/analytics/occupancy?property_id=${propertyId}`
      : '/analytics/occupancy';
    return api.get(url);
  },
  
  getPaymentAnalytics: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/analytics/payments?${params.toString()}`);
  },
  
  getMaintenanceAnalytics: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/analytics/maintenance?${params.toString()}`);
  },
  
  exportToExcel: (exportType, filters = {}) => {
    const params = new URLSearchParams();
    params.append('export_type', exportType);
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/analytics/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  
  getMonthlyReport: (year, month, propertyId = null) => {
    const url = propertyId 
      ? `/analytics/monthly-report/${year}/${month}?property_id=${propertyId}`
      : `/analytics/monthly-report/${year}/${month}`;
    return api.get(url);
  }
};

