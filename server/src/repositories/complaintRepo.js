import fileStore from '../utils/fileStore.js';

const COLLECTION = 'complaints';

export const complaintRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByTrackingNumber: async (trackingNumber) => {
    const records = await fileStore.read(COLLECTION);
    return records.find((c) => c.trackingNumber === trackingNumber) || null;
  },
  findByStatus: async (status) => {
    return fileStore.findWhere(COLLECTION, { status });
  },
  findByCategory: async (categoryId) => {
    return fileStore.findWhere(COLLECTION, { categoryId });
  },
  findByUser: async (userId) => {
    return fileStore.findWhere(COLLECTION, (c) => c.createdBy?.id === userId);
  },
  findByAssignee: async (staffId) => {
    return fileStore.findWhere(COLLECTION, (c) => c.assignedTo?.id === staffId);
  },
  findOverdue: async () => {
    return fileStore.findWhere(COLLECTION, (c) => c.isOverdue === true);
  },
  findWhere: async (predicateOrQuery, optionalPredicate) => {
    if (typeof predicateOrQuery === 'string' && optionalPredicate) {
      return fileStore.findWhere(predicateOrQuery, optionalPredicate);
    }
    return fileStore.findWhere(COLLECTION, predicateOrQuery);
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  update: async (id, updates) => fileStore.update(COLLECTION, id, updates),
  delete: async (id) => fileStore.remove(COLLECTION, id),
  countByStatus: async () => {
    const all = await fileStore.read(COLLECTION);
    return all.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
  },
};

export default complaintRepo;
