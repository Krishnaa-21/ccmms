import apiClient from './client.js';

export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await apiClient.patch('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return res.data;
  }
};

export default authApi;

