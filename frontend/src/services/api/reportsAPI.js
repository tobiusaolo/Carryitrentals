import api from './api';

const reportsAPI = {
  // PDF Report Generation - All use authenticated api instance
  generateTenantStatementPDF: async (tenantId, year, month) => {
    const response = await api.get(
      `/reports/tenant-statement/${tenantId}/pdf?year=${year}&month=${month}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  generatePropertyReportPDF: async (propertyId, startDate, endDate) => {
    const response = await api.get(
      `/reports/property-report/${propertyId}/pdf?start_date=${startDate}&end_date=${endDate}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  generateYearEndReportPDF: async (year) => {
    const response = await api.get(
      `/reports/year-end/${year}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  generateTaxReportPDF: async (propertyId, year) => {
    const response = await api.get(
      `/reports/tax-report/${propertyId}/${year}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Helper function to download blob as file
  downloadPDF: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default reportsAPI;

