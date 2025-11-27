import authService from '../authService';

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
    return authService.get(`/units/${queryString ? `?${queryString}` : ''}`);
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
    return authService.get(`/units/${queryString ? `?${queryString}` : ''}`);
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
    return authService.get(`/rental-units/${queryString ? `?${queryString}` : ''}`);
  },

  // Get a single unit by ID
  getUnit: (id) => authService.get(`/units/${id}`),

  // Get a single rental unit by ID
  getRentalUnit: (id) => authService.get(`/rental-units/${id}`),

  // Create a new unit
  createUnit: (unitData) => authService.post(`/units/`, unitData, { timeout: 120000 }),

  // Create a new rental unit
  createRentalUnit: (unitData) => authService.post(`/rental-units/`, unitData, { timeout: 120000 }),

  // Update an existing unit
  updateUnit: (id, unitData) => authService.put(`/units/${id}`, unitData),

  // Update rental unit
  updateRentalUnit: (id, unitData) => authService.put(`/rental-units/${id}`, unitData),

  // Delete a unit
  deleteUnit: (id) => authService.delete(`/units/${id}`),

  // Delete rental unit
  deleteRentalUnit: (id) => authService.delete(`/rental-units/${id}`),

  // Upload unit images
  uploadUnitImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return authService.post(`/units/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutes for large image uploads
    });
  },

  // Upload rental unit images
  uploadRentalUnitImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return authService.post(`/rental-units/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutes for large image uploads
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
    return authService.get(`/units/search/${query}${queryString ? `?${queryString}` : ''}`);
  }
};