import fileStore from '../utils/fileStore.js';

const COLLECTION = 'feedback';

export const feedbackRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByComplaintId: async (complaintId) => {
    const list = await fileStore.read(COLLECTION);
    return list.find((f) => String(f.complaintId) === String(complaintId)) || null;
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  getAverageRating: async () => {
    const list = await fileStore.read(COLLECTION);
    if (!list.length) return 0;
    const sum = list.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return +(sum / list.length).toFixed(1);
  },
};

export default feedbackRepo;
