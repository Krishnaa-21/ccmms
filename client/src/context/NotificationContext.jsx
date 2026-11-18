import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { notificationApi } from '../api/notificationApi.js';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await notificationApi.getNotifications({ limit: 15 });
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[NotificationContext] Failed to load notifications:', err.message);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
    }
  }, [accessToken, fetchNotifications]);

  // Connect to SSE Stream
  useEffect(() => {
    if (!accessToken || !user) return;

    let eventSource = null;
    const streamUrl = `/api/notifications/stream?token=${encodeURIComponent(accessToken)}`;

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const newNotif = JSON.parse(event.data);
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Pop non-intrusive toast
          toast(newNotif.title, {
            icon: '🔔',
            duration: 4000,
            style: {
              borderRadius: '8px',
              background: '#0f2942',
              color: '#ffffff',
              fontSize: '13px'
            }
          });
        } catch (e) {
          console.error('[SSE] Failed to parse notification payload', e);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('[SSE] EventSource init error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [accessToken, user]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationStream() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationStream must be used within a NotificationProvider');
  }
  return context;
}

export const useNotifications = useNotificationStream;

export default NotificationContext;
