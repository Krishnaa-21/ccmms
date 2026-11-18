import fileStore from '../utils/fileStore.js';

const COLLECTION = 'auditLog';

export const auditLogRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  create: async (entry) => fileStore.insert(COLLECTION, entry),
  findByEntity: async (entityType, entityId) => {
    return fileStore.findWhere(COLLECTION, (item) => {
      return item.entityType === entityType && String(item.entityId) === String(entityId);
    });
  },
};

export default auditLogRepo;
