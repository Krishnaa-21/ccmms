import fileStore from '../utils/fileStore.js';

const COLLECTION = 'statusHistory';

export const statusHistoryRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByComplaintId: async (complaintId) => {
    return fileStore.findWhere(COLLECTION, (item) => String(item.complaintId) === String(complaintId));
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
};

export default statusHistoryRepo;
