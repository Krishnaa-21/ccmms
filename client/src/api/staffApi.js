import apiClient from './client.js';

export const staffApi = {
  // Fetch tasks assigned to the logged-in staff member
  getMyTasks: async (params = {}) => {
    const res = await apiClient.get('/complaints', { params });
    return res.data;
  },

  // Fetch technician's personal performance scorecard
  getMyPerformance: async () => {
    const res = await apiClient.get('/analytics/my-performance');
    return res.data;
  },

  // Toggle availability status
  updateAvailability: async (isAvailable) => {
    const res = await apiClient.patch('/auth/me/availability', { isAvailable });
    return res.data;
  },

  // Accept and begin work: Assigned -> In Progress
  startWork: async (id, notes = 'Technician accepted work order and commenced on-site service') => {
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'In Progress',
      notes
    });
    return res.data;
  },

  // Mark task Awaiting Parts: In Progress -> Awaiting Parts
  markAwaitingParts: async (id, { partName, expectedDate, notes }) => {
    const combinedNotes = `Awaiting Parts: ${partName}${expectedDate ? ` (Expected: ${expectedDate})` : ''}. ${notes || ''}`.trim();
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'Awaiting Parts',
      notes: combinedNotes
    });
    return res.data;
  },

  // Resume work from Awaiting Parts: Awaiting Parts -> In Progress
  resumeWork: async (id, notes = 'Parts arrived, resuming maintenance work') => {
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'In Progress',
      notes
    });
    return res.data;
  },

  // Mark task Resolved: In Progress -> Resolved
  resolveTask: async (id, { resolutionNotes, timeSpentHours, partsUsed, estimatedCost }) => {
    const res = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'Resolved',
      resolutionNotes,
      timeSpentHours,
      partsUsed,
      estimatedCost
    });
    return res.data;
  },

  getInventory: async () => {
    const res = await apiClient.get('/inventory');
    return res.data;
  },

  recordPartsUsed: async (complaintId, parts) => {
    const res = await apiClient.post('/inventory/record-usage', { complaintId, parts });
    return res.data;
  }
};

export default staffApi;

