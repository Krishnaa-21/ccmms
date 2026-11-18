import fileStore from '../utils/fileStore.js';

const COLLECTION = 'users';

export const userRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByEmail: async (email) => {
    const users = await fileStore.read(COLLECTION);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findByRole: async (role) => {
    return fileStore.findWhere(COLLECTION, (u) => u.role === role);
  },
  create: async (userData) => fileStore.insert(COLLECTION, userData),
  update: async (id, updates) => fileStore.update(COLLECTION, id, updates),
  delete: async (id) => fileStore.remove(COLLECTION, id),
};

export default userRepo;
