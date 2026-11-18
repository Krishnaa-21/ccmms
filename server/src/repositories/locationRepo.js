import fileStore from '../utils/fileStore.js';

const COLLECTION = 'locations';

export const locationRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByCampus: async (campusId) => fileStore.findWhere(COLLECTION, { campusId }),
  findWhere: async (predicateOrQuery, optionalPredicate) => {
    if (typeof predicateOrQuery === 'string' && optionalPredicate) {
      return fileStore.findWhere(predicateOrQuery, optionalPredicate);
    }
    return fileStore.findWhere(COLLECTION, predicateOrQuery);
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  update: async (id, updates) => fileStore.update(COLLECTION, id, updates),
  delete: async (id) => fileStore.remove(COLLECTION, id)
};

export default locationRepo;
