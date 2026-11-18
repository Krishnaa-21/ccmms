import apiClient from './client.js';

export const notificationApi = {
  getNotifications: async (params = {}) => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  }
};

export default notificationApi;
