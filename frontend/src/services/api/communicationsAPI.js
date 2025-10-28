import api from './api';

const communicationsAPI = {
  // Message Templates - All use authenticated api instance
  getTemplates: async () => {
    const response = await api.get('/communications/templates');
    return response.data;
  },

  createTemplate: async (templateData) => {
    const response = await api.post('/communications/templates', templateData);
    return response.data;
  },

  updateTemplate: async (templateId, templateData) => {
    const response = await api.put(`/communications/templates/${templateId}`, templateData);
    return response.data;
  },

  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/communications/templates/${templateId}`);
    return response.data;
  },

  seedDefaultTemplates: async () => {
    const response = await api.post('/communications/templates/seed-defaults');
    return response.data;
  },

  // Bulk Messaging
  sendBulkMessage: async (bulkMessageData) => {
    const response = await api.post('/communications/bulk-send', bulkMessageData);
    return response.data;
  },

  getRecipientGroups: async () => {
    const response = await api.get('/communications/recipient-groups');
    return response.data;
  },

  // Communication Logs
  getCommunicationLogs: async (statusFilter = null) => {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await api.get('/communications/logs', { params });
    return response.data;
  },

  getCommunicationLog: async (logId) => {
    const response = await api.get(`/communications/logs/${logId}`);
    return response.data;
  }
};

export default communicationsAPI;

