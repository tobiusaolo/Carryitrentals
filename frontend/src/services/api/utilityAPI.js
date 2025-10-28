import api from './api';

export const utilityAPI = {
  // Property-level utilities
  getUtilities: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/utilities?${params.toString()}`);
  },

  getUtilityById: (utilityId) => 
    api.get(`/utilities/${utilityId}`),

  createUtility: (utilityData) => 
    api.post('/utilities/', utilityData),

  updateUtility: (utilityId, utilityData) => 
    api.put(`/utilities/${utilityId}`, utilityData),

  deleteUtility: (utilityId) => 
    api.delete(`/utilities/${utilityId}`),

  // Unit-level utilities
  getUnitUtilities: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/unit-utilities?${params.toString()}`);
  },

  getUnitUtilityById: (utilityId) => 
    api.get(`/unit-utilities/${utilityId}`),

  createUnitUtility: (utilityData) => 
    api.post('/unit-utilities/', utilityData),

  updateUnitUtility: (utilityId, utilityData) => 
    api.put(`/unit-utilities/${utilityId}`, utilityData),

  deleteUnitUtility: (utilityId) => 
    api.delete(`/unit-utilities/${utilityId}`),

  // Get utilities for a specific unit
  getUtilitiesForUnit: (unitId) => 
    api.get(`/unit-utilities?unit_id=${unitId}`),

  // Get utilities for a specific property
  getUtilitiesForProperty: (propertyId) => 
    api.get(`/utilities?property_id=${propertyId}`),
};









