import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications.js';
import { Button } from '../../components/ui/Button.jsx';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const navigate = useNavigate();

  const filtered =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle2 className="w-5 h-5 text-primary-600" />;
      case 'sla_warning':
      case 'sla_breach':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      case 'feedback_request':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary-600" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time status updates, SLA milestone warnings, and technician communications.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark all as read
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-primary-600 text-white text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              No notifications to display
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'All your notifications have been marked as read.'
                : 'You are completely caught up! New status changes and assignments will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !item.isRead
                  ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200 dark:border-primary-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shrink-0">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm truncate ${
                      !item.isRead
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-semibold text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform">
                    <span>View complaint details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div
                className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
