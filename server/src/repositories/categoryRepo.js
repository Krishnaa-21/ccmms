import fileStore from '../utils/fileStore.js';

const COLLECTION = 'categories';

export const categoryRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByName: async (name) => {
    const categories = await fileStore.read(COLLECTION);
    return categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  update: async (id, updates) => fileStore.update(COLLECTION, id, updates),
  delete: async (id) => fileStore.remove(COLLECTION, id),
};

export default categoryRepo;
