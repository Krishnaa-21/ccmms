import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotificationStream } from '../../context/NotificationContext.jsx';
import QuickTrackModal from '../common/QuickTrackModal.jsx';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  CheckCheck,
  ExternalLink,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStream();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/student/notifications');
    }
  };

  return (
    <>
      <header className="h-16 bg-surface-card border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left: Mobile hamburger & Quick search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-surface-100 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Track Search Button */}
          <button
            onClick={() => setIsTrackModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-50 dark:bg-surface-100/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs w-48 sm:w-64 transition-colors text-left"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Track ticket by reference...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-surface-card border border-surface-border rounded px-1 text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons: Notification Bell, Theme Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-surface-100 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-surface-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-card border border-surface-border shadow-popover z-50 overflow-hidden animate-slide-up">
                <div className="p-3.5 border-b border-surface-border flex items-center justify-between bg-surface-50 dark:bg-surface-100/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-xs cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-100/70 transition-colors flex items-start gap-2.5 ${
                          !n.isRead ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !n.isRead ? 'bg-primary-600' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {n.title}
                          </p>
                          <p className="text-slate-500 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-surface-border bg-surface-50 dark:bg-surface-100/50 text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/student/notifications');
                    }}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all notifications</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: user?.avatarColor || '#1e3a8a' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface-card border border-surface-border shadow-popover z-50 py-1 animate-slide-up text-xs">
                <div className="px-3 py-2 border-b border-surface-border">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/student/profile');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surface-100 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/student/settings');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surface-100 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-surface-border my-1" />

                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Track Modal */}
      <QuickTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </>
  );
}

export default Topbar;
