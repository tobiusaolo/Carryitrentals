import authService from '../authService';

export const notificationAPI = {
  // Get all notifications for current user
  getNotifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`/notifications/${queryString ? `?${queryString}` : ''}`);
  },

  // Get unread notification count
  getUnreadCount: () => 
    authService.get('/notifications/unread-count'),

  // Get all notifications (admin only)
  getAllNotifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return authService.get(`/notifications/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get notification by ID
  getNotification: (notificationId) => 
    authService.get(`/notifications/${notificationId}`),

  // Create notification (admin only)
  createNotification: (notificationData) => 
    authService.post('/notifications/', notificationData),

  // Update notification
  updateNotification: (notificationId, notificationData) => 
    authService.put(`/notifications/${notificationId}`, notificationData),

  // Delete notification (admin only)
  deleteNotification: (notificationId) => 
    authService.delete(`/notifications/${notificationId}`),

  // Mark notification as read
  markAsRead: (notificationId) => 
    authService.post(`/notifications/${notificationId}/mark-read`),

  // Mark all notifications as read
  markAllAsRead: () => 
    authService.post('/notifications/mark-all-read'),
};

export default notificationAPI;

