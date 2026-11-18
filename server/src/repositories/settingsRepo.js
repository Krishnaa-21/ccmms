import fileStore from '../utils/fileStore.js';

const COLLECTION = 'settings';

export const settingsRepo = {
  getSettings: async (campusId = process.env.CAMPUS_ID || 'apex-campus-main') => {
    const list = await fileStore.read(COLLECTION);
    return list.find((s) => s.campusId === campusId) || list[0] || null;
  },
  updateSettings: async (updates, campusId = process.env.CAMPUS_ID || 'apex-campus-main') => {
    const list = await fileStore.read(COLLECTION);
    const existing = list.find((s) => s.campusId === campusId);
    if (existing) {
      return fileStore.update(COLLECTION, existing.id, updates);
    }
    return fileStore.insert(COLLECTION, { campusId, ...updates });
  },
};

export default settingsRepo;
