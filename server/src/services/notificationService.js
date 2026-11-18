import { notificationRepo, sentMessageRepo, userRepo } from '../repositories/index.js';
import { sseManager } from './sseManager.js';

export const notificationService = {
  /**
   * Creates an in-app notification, triggers real-time SSE push,
   * and records a simulated external message (Email / SMS) log.
   */
  async createNotification({ userId, title, message, type = 'general', link = '' }) {
    // 1. Create in-app notification record
    const notif = await notificationRepo.create({
      userId,
      title,
      message,
      type,
      link,
      isRead: false
    });

    // 2. Stream real-time notification to client if connected via SSE
    sseManager.sendToUser(userId, 'notification', notif);

    // 3. Record simulated Email / SMS transmission
    try {
      const recipient = await userRepo.findById(userId);
      if (recipient) {
        // High priority / SLA breaches simulate SMS, regular notifications simulate Email
        const isUrgent = type.includes('sla') || type.includes('urgent') || type.includes('assigned');
        await sentMessageRepo.create({
          userId,
          channel: isUrgent ? 'SMS' : 'EMAIL',
          to: isUrgent ? (recipient.phone || recipient.email) : recipient.email,
          recipientName: recipient.name,
          subject: title,
          body: message,
          status: 'DELIVERED',
          sentAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[NotificationService] Error logging simulated message:', err);
    }

    return notif;
  },

  async getNotifications(userId, { unreadOnly = false, page = 1, limit = 20 }) {
    let list = await notificationRepo.findByUserId(userId);

    if (unreadOnly === 'true' || unreadOnly === true) {
      list = list.filter((n) => !n.isRead);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      notifications: paginated,
      unreadCount: list.filter((n) => !n.isRead).length,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async markAsRead(id, userId) {
    const notif = (await notificationRepo.findAll()).find(
      (n) => String(n.id) === String(id) && String(n.userId) === String(userId)
    );

    if (!notif) {
      const err = new Error('Notification not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }

    return notificationRepo.markAsRead(id);
  },

  async markAllAsRead(userId) {
    await notificationRepo.markAllAsReadForUser(userId);
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(id, userId) {
    const list = await notificationRepo.findAll();
    const notif = list.find((n) => String(n.id) === String(id) && String(n.userId) === String(userId));
    if (!notif) {
      const err = new Error('Notification not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }

    // Use fileStore remove
    const { remove } = await import('../utils/fileStore.js');
    await remove('notifications', id);
    return { message: 'Notification deleted successfully' };
  },

  async getSentMessages(filters = {}) {
    let messages = await sentMessageRepo.findAll();
    if (filters.channel) {
      messages = messages.filter((m) => m.channel === filters.channel);
    }
    if (filters.recipient) {
      const q = filters.recipient.toLowerCase();
      messages = messages.filter((m) => m.to.toLowerCase().includes(q) || m.recipientName.toLowerCase().includes(q));
    }
    messages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return messages;
  }
};

export default notificationService;
