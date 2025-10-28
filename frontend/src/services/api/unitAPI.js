import authService from '../authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com';

export const unitAPI = {
  // Get all units
  getUnits: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`${API_BASE_URL}/api/v1/units/${queryString ? `?${queryString}` : ''}`);
  },

  // Alias for getAllUnits (used by Redux)
  getAllUnits: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`${API_BASE_URL}/api/v1/units/${queryString ? `?${queryString}` : ''}`);
  },

  // Get rental units (for rent)
  getRentalUnits: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`${API_BASE_URL}/api/v1/rental-units/${queryString ? `?${queryString}` : ''}`);
  },

  // Get a single unit by ID
  getUnit: (id) => authService.get(`${API_BASE_URL}/api/v1/units/${id}`),

  // Create a new unit
  createUnit: (unitData) => authService.post(`${API_BASE_URL}/api/v1/units/`, unitData),

  // Create a new rental unit
  createRentalUnit: (unitData) => authService.post(`${API_BASE_URL}/api/v1/rental-units/`, unitData),

  // Update an existing unit
  updateUnit: (id, unitData) => authService.put(`${API_BASE_URL}/api/v1/units/${id}`, unitData),

  // Update rental unit
  updateRentalUnit: (id, unitData) => authService.put(`${API_BASE_URL}/api/v1/rental-units/${id}`, unitData),

  // Delete a unit
  deleteUnit: (id) => authService.delete(`${API_BASE_URL}/api/v1/units/${id}`),

  // Delete rental unit
  deleteRentalUnit: (id) => authService.delete(`${API_BASE_URL}/api/v1/rental-units/${id}`),

  // Upload unit images
  uploadUnitImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return authService.post(`${API_BASE_URL}/api/v1/units/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload rental unit images
  uploadRentalUnitImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return authService.post(`${API_BASE_URL}/api/v1/rental-units/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Search units
  searchUnits: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`${API_BASE_URL}/api/v1/units/search/${query}${queryString ? `?${queryString}` : ''}`);
  }
};