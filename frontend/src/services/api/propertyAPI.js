import authService from '../authService';

export const propertyAPI = {
  getAllProperties: () => 
    authService.get('/properties/'),
  
  getPropertyById: (propertyId) => 
    authService.get(`/properties/${propertyId}/`),
  
  createProperty: (propertyData) => 
    authService.post('/properties/', propertyData),
  
  updateProperty: (propertyId, propertyData) => 
    authService.put(`/properties/${propertyId}/`, propertyData),
  
  deleteProperty: (propertyId) => 
    authService.delete(`/properties/${propertyId}/`),
  
  getPropertiesByOwner: (ownerId) => 
    authService.get(`/properties/?owner_id=${ownerId}`),
  
  generatePropertyQR: (propertyId) => 
    authService.post(`/property-qr/generate/${propertyId}`),
  
  getPropertyQR: (propertyId) => 
    authService.get(`/property-qr/${propertyId}`),
};


