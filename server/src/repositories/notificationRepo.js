import fileStore from '../utils/fileStore.js';

const COLLECTION = 'notifications';

export const notificationRepo = {
  findAll: async () => fileStore.read(COLLECTION),
  findByUserId: async (userId) => {
    return fileStore.findWhere(COLLECTION, (n) => String(n.userId) === String(userId));
  },
  findUnreadByUserId: async (userId) => {
    return fileStore.findWhere(COLLECTION, (n) => String(n.userId) === String(userId) && !n.isRead);
  },
  create: async (data) => fileStore.insert(COLLECTION, data),
  markAsRead: async (id) => fileStore.update(COLLECTION, id, { isRead: true, readAt: new Date().toISOString() }),
  markAllAsReadForUser: async (userId) => {
    const list = await fileStore.read(COLLECTION);
    const updated = list.map((item) => {
      if (String(item.userId) === String(userId) && !item.isRead) {
        return { ...item, isRead: true, readAt: new Date().toISOString() };
      }
      return item;
    });
    return fileStore.write(COLLECTION, updated);
  },
};

export default notificationRepo;
