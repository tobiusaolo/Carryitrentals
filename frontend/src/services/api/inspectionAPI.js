import api from './api';

export const inspectionAPI = {
  getAllInspections: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/rental-units/inspections?${params.toString()}`);
  },
  
  getInspectionById: (inspectionId) => 
    api.get(`/rental-units/inspections/${inspectionId}`),
  
  bookInspection: (unitId, inspectionData) => 
    api.post(`/rental-units/${unitId}/book-inspection`, inspectionData),
  
  updateInspection: (inspectionId, inspectionData) => 
    api.put(`/rental-units/inspections/${inspectionId}`, inspectionData),
  
  cancelInspection: (inspectionId) => 
    api.delete(`/rental-units/inspections/${inspectionId}`),
  
  getMyBookings: () => 
    api.get('/rental-units/inspections/my-bookings'),
  
  getPendingInspections: () => 
    api.get('/rental-units/inspections/pending'),
  
  getUnitInspections: (unitId) => 
    api.get(`/rental-units/${unitId}/inspections`),
};










