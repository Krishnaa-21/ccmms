import apiClient from './client.js';

export const complaintApi = {
  getComplaints: async (params = {}) => {
    const res = await apiClient.get('/complaints', { params });
    return res.data;
  },

  getComplaintById: async (id) => {
    const res = await apiClient.get(`/complaints/${id}`);
    return res.data;
  },

  createComplaint: async (formData) => {
    const res = await apiClient.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  upvoteComplaint: async (id) => {
    const res = await apiClient.post(`/complaints/${id}/upvote`);
    return res.data;
  },

  suggestPriority: async (title, description, categoryId) => {
    const res = await apiClient.post('/complaints/suggest-priority', {
      title,
      description,
      categoryId
    });
    return res.data;
  },

  cancelComplaint: async (id, reason = 'Cancelled by student') => {
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'Rejected',
      notes: reason,
      rejectionReason: reason
    });
    return res.data;
  },

  reopenComplaint: async (id, reason) => {
    const res = await apiClient.post(`/complaints/${id}/reopen`, { reason });
    return res.data;
  },

  getComments: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/comments`);
    return res.data;
  },

  addComment: async (id, { content, isInternal = false }) => {
    const res = await apiClient.post(`/complaints/${id}/comments`, {
      content,
      isInternal
    });
    return res.data;
  },

  submitFeedback: async (id, feedbackData) => {
    const res = await apiClient.post(`/complaints/${id}/feedback`, feedbackData);
    return res.data;
  },

  getCategories: async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data?.data?.categories) return res.data.data.categories;
    } catch (_) {}
    const res = await apiClient.get('/demo/categories');
    return res.data.data;
  },

  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data.data.settings;
  },

  getPublicBoard: async (params = {}) => {
    const res = await apiClient.get('/complaints/public-board', { params });
    return res.data;
  },

  checkDuplicates: async (params = {}) => {
    const res = await apiClient.get('/complaints/check-duplicates', { params });
    return res.data;
  },

  mergeComplaints: async (parentId, { duplicateIds, reason }) => {
    const res = await apiClient.post(`/complaints/${parentId}/merge`, {
      duplicateIds,
      reason
    });
    return res.data;
  }
};

export default complaintApi;
