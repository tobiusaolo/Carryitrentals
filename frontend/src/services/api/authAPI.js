import api from './api';

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  
  logout: () => 
    api.post('/auth/logout'),
};










