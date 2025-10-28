import api from './api';

const adminAPI = {
  // Get comprehensive admin dashboard statistics
  getAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get recent system activity
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/admin/recent-activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get system alerts
  getSystemAlerts: async () => {
    try {
      const response = await api.get('/admin/system-alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/auth/users?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (userId) => {
    try {
      const response = await api.get(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get all properties with detailed information
  getAllProperties: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/properties/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get all tenants with detailed information
  getAllTenants: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/tenants/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Get all units with detailed information
  getAllUnits: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/units/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  },

  // Get all rental units
  getAllRentalUnits: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/rental-units/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental units:', error);
      throw error;
    }
  },

  // Get all agents
  getAllAgents: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/agents/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Get all payments
  getAllPayments: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/payments/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get all maintenance requests
  getAllMaintenanceRequests: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/maintenance/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw error;
    }
  },

  // Get all inspection bookings
  getAllInspectionBookings: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/inspections/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspection bookings:', error);
      throw error;
    }
  }
};

export default adminAPI;
