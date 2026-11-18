import { notificationService } from '../services/notificationService.js';
import { sseManager } from '../services/sseManager.js';
import asyncHandler from '../utils/asyncHandler.js';

export const streamNotifications = (req, res) => {
  // Pass to SSE Manager
  sseManager.addClient(req.user.id, req.user.role, res);
};

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user.id, req.query);
  res.json({
    success: true,
    data: result.notifications,
    unreadCount: result.unreadCount,
    pagination: result.pagination
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markAsRead(req.params.id, req.user.id);
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: updated
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.json({
    success: true,
    message: result.message
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user.id);
  res.json({
    success: true,
    message: result.message
  });
});

export const getSentMessages = asyncHandler(async (req, res) => {
  const messages = await notificationService.getSentMessages(req.query);
  res.json({
    success: true,
    data: messages
  });
});

export default {
  streamNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getSentMessages
};
