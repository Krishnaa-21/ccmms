import fileStore from '../utils/fileStore.js';

const COLLECTION = 'sentMessages';

export const sentMessageRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findById: async (id) => fileStore.findById(COLLECTION, id),
  findByRecipient: async (recipient) => {
    return fileStore.findWhere(COLLECTION, (msg) => msg.to === recipient);
  },
  create: async (message) => fileStore.insert(COLLECTION, message),
};

export default sentMessageRepo;

