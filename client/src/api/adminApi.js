import apiClient from './client.js';

export const adminApi = {
  // --- Executive Analytics ---
  getOverview: async (params = {}) => {
    const res = await apiClient.get('/analytics/overview', { params });
    return res.data;
  },

  getByCategory: async () => {
    const res = await apiClient.get('/analytics/by-category');
    return res.data;
  },

  getByStatus: async () => {
    const res = await apiClient.get('/analytics/by-status');
    return res.data;
  },

  getByPriority: async () => {
    const res = await apiClient.get('/analytics/by-priority');
    return res.data;
  },

  getByBuilding: async () => {
    const res = await apiClient.get('/analytics/by-building');
    return res.data;
  },

  getMonthlyTrend: async () => {
    const res = await apiClient.get('/analytics/monthly-trend');
    return res.data;
  },

  getStaffPerformance: async () => {
    const res = await apiClient.get('/analytics/staff-performance');
    return res.data;
  },

  getAttentionNeeded: async () => {
    const res = await apiClient.get('/analytics/attention-needed');
    return res.data;
  },

  // --- User Management ---
  getUsers: async (params = {}) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await apiClient.patch(`/users/${id}`, userData);
    return res.data;
  },

  updateUserStatus: async (id, isActive) => {
    const res = await apiClient.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },

  // --- Complaint Workflow & Administration ---
  assignComplaint: async (id, { staffId, reason = 'Assigned by Administrator' }) => {
    const res = await apiClient.patch(`/complaints/${id}/assign`, { staffId, reason });
    return res.data;
  },

  changePriority: async (id, { priority, reason = 'Priority adjusted by Administrator' }) => {
    const res = await apiClient.patch(`/complaints/${id}/priority`, { priority, reason });
    return res.data;
  },

  changeStatus: async (id, { status, notes, rejectionReason, resolutionNotes }) => {
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status,
      notes,
      rejectionReason,
      resolutionNotes
    });
    return res.data;
  },

  closeComplaint: async (id, { notes = 'Verified and closed by Administrator' } = {}) => {
    const res = await apiClient.post(`/complaints/${id}/close`, { notes });
    return res.data;
  },

  reopenComplaint: async (id, { reason }) => {
    const res = await apiClient.post(`/complaints/${id}/reopen`, { reason });
    return res.data;
  },

  deleteComplaint: async (id) => {
    const res = await apiClient.delete(`/complaints/${id}`);
    return res.data;
  },

  // --- Bulk Actions ---
  bulkAssign: async (complaintIds, staffId, reason) => {
    return Promise.all(
      complaintIds.map((id) =>
        apiClient.patch(`/complaints/${id}/assign`, { staffId, reason })
      )
    );
  },

  bulkPriority: async (complaintIds, priority, reason) => {
    return Promise.all(
      complaintIds.map((id) =>
        apiClient.patch(`/complaints/${id}/priority`, { priority, reason })
      )
    );
  },

  bulkStatus: async (complaintIds, status, notes) => {
    return Promise.all(
      complaintIds.map((id) =>
        apiClient.patch(`/complaints/${id}/status`, { status, notes })
      )
    );
  },

  bulkClose: async (complaintIds, notes) => {
    return Promise.all(
      complaintIds.map((id) =>
        apiClient.post(`/complaints/${id}/close`, { notes: notes || 'Batch closed' })
      )
    );
  },

  // --- Settings & Category Configuration ---
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await apiClient.patch('/settings', settingsData);
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await apiClient.post('/settings/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiClient.patch(`/settings/categories/${id}`, categoryData);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/settings/categories/${id}`);
    return res.data;
  },

  // --- Audit Logs & Maintenance Operations ---
  getAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/audit', { params });
    return res.data;
  },

  resetDemoData: async () => {
    const res = await apiClient.post('/admin/reset-demo-data');
    return res.data;
  },

  triggerSlaScan: async () => {
    const res = await apiClient.post('/admin/trigger-sla-scan');
    return res.data;
  },

  // --- Phase 5: Preventive Maintenance ---
  getPreventivePlans: async (params = {}) => {
    const res = await apiClient.get('/preventive-plans', { params });
    return res.data;
  },

  createPreventivePlan: async (planData) => {
    const res = await apiClient.post('/preventive-plans', planData);
    return res.data;
  },

  updatePreventivePlan: async (id, planData) => {
    const res = await apiClient.patch(`/preventive-plans/${id}`, planData);
    return res.data;
  },

  deletePreventivePlan: async (id) => {
    const res = await apiClient.delete(`/preventive-plans/${id}`);
    return res.data;
  },

  runPreventivePlanNow: async (id) => {
    const res = await apiClient.post(`/preventive-plans/${id}/run-now`);
    return res.data;
  },

  // --- Phase 5: QR Codes & Campus Locations ---
  getLocations: async (params = {}) => {
    const res = await apiClient.get('/locations', { params });
    return res.data;
  },

  createLocation: async (locationData) => {
    const res = await apiClient.post('/locations', locationData);
    return res.data;
  },

  getCampuses: async () => {
    const res = await apiClient.get('/locations/campuses');
    return res.data;
  },

  // --- Phase 5: Outbox / Sent Messages Inspector ---
  getSentMessages: async (params = {}) => {
    const res = await apiClient.get('/notifications/sent-messages', { params });
    return res.data;
  },

  // --- Phase 5: Predictive Facilities Insights ---
  getPredictiveInsights: async (params = {}) => {
    const res = await apiClient.get('/analytics/predictive-insights', { params });
    return res.data;
  },

  // --- Phase 5: Spare Parts Inventory ---
  getInventory: async () => {
    const res = await apiClient.get('/inventory');
    return res.data;
  },

  recordPartsUsed: async (data) => {
    const res = await apiClient.post('/inventory/record-usage', data);
    return res.data;
  },

  // --- Phase 5: Duplicate Merging ---
  mergeComplaints: async (parentId, { duplicateIds, reason }) => {
    const res = await apiClient.post(`/complaints/${parentId}/merge`, { duplicateIds, reason });
    return res.data;
  }
};

export default adminApi;

