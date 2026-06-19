import api from './api';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export const additionalServicesAPI = {
  // Get all additional services (public endpoint - uses production URL)
  getAllServices: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    
    // For admin, use authenticated API
    const token = localStorage.getItem('token');
    if (token) {
      return api.get(`/additional-services/${queryString ? `?${queryString}` : ''}`);
    }
    
    // For public access, use production URL directly
    return axios.get(`${API_BASE_URL}/additional-services/${queryString ? `?${queryString}` : ''}`);
  },

  // Get active services only (public endpoint - uses correct API URL)
  getActiveServices: () => {
    const baseURL = API_BASE_URL.replace(/\/$/, '');
    return axios.get(`${baseURL}/additional-services/?active_only=true`);
  },

  // Get a specific service by ID (public endpoint - uses production URL)
  getService: (serviceId) => {
    return axios.get(`${API_BASE_URL}/additional-services/${serviceId}`);
  },

  // Create a new service (admin only - uses authenticated API)
  createService: (serviceData) => {
    return api.post('/additional-services/', serviceData);
  },

  // Update a service (admin only - uses authenticated API)
  updateService: (serviceId, serviceData) => {
    return api.put(`/additional-services/${serviceId}`, serviceData);
  },

  // Delete a service (admin only - uses authenticated API)
  deleteService: (serviceId) => {
    return api.delete(`/additional-services/${serviceId}`);
  }
};

export default additionalServicesAPI;

