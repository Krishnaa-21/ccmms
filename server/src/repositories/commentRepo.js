import fileStore from '../utils/fileStore.js';

const COLLECTION = 'comments';

export const commentRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByComplaintId: async (complaintId) => {
    return fileStore.findWhere(COLLECTION, (c) => String(c.complaintId) === String(complaintId));
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  delete: async (id) => fileStore.remove(COLLECTION, id),
};

export default commentRepo;
