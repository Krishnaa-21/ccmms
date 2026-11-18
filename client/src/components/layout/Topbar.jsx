import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotificationStream } from '../../context/NotificationContext.jsx';
import { adminApi } from '../../api/adminApi.js';
import { staffApi } from '../../api/staffApi.js';
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
  ChevronDown,
  RefreshCw,
  Power,
  ShieldAlert,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Topbar({ onMenuClick }) {
  const { user, logout, updateUserProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStream();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isScanningSla, setIsScanningSla] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const role = user?.role || 'student';

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
      if (role === 'admin') navigate('/admin/complaints');
      else if (role === 'staff') navigate('/staff/tasks');
      else navigate('/student/notifications');
    }
  };

  // Admin SLA Scan
  const handleTriggerSlaScan = async () => {
    setIsScanningSla(true);
    try {
      const res = await adminApi.triggerSlaScan();
      toast.success(res.message || 'SLA monitoring scan completed');
    } catch (err) {
      toast.error('Failed to trigger SLA scan');
    } finally {
      setIsScanningSla(false);
    }
  };

  // Staff Availability Toggle
  const handleToggleAvailability = async () => {
    const nextState = !user?.isAvailable;
    setIsUpdatingAvailability(true);
    try {
      await staffApi.updateAvailability(nextState);
      updateUserProfile({ ...user, isAvailable: nextState });
      toast.success(`You are now ${nextState ? 'Available for dispatch' : 'marked Busy / Off-Duty'}`);
    } catch (err) {
      toast.error('Failed to update availability status');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const getProfileSettingsLink = () => {
    if (role === 'admin') return '/admin/settings';
    return '/student/settings';
  };

  const getProfileLink = () => {
    if (role === 'admin') return '/admin/users';
    if (role === 'staff') return '/staff/performance';
    return '/student/profile';
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-50 dark:bg-surface-100/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs w-44 sm:w-64 transition-colors text-left"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Track reference #...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-surface-card border border-surface-border rounded px-1 text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin SLA Trigger Action */}
          {role === 'admin' && (
            <button
              onClick={handleTriggerSlaScan}
              disabled={isScanningSla}
              title="Run instant SLA audit scan"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningSla ? 'animate-spin' : ''}`} />
              <span>SLA Scan</span>
            </button>
          )}

          {/* Staff Availability Switch Pill */}
          {role === 'staff' && (
            <button
              onClick={handleToggleAvailability}
              disabled={isUpdatingAvailability}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                user?.isAvailable !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user?.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {user?.isAvailable !== false ? 'Available' : 'Off-Duty'}
              </span>
            </button>
          )}

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
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-surface-card animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-card border border-surface-border shadow-popover z-50 overflow-hidden animate-slide-up text-xs">
                <div className="p-3 border-b border-surface-border flex items-center justify-between bg-surface-50/50 dark:bg-surface-100/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-surface-100 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-primary-50/30 dark:bg-primary-950/20' : ''
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
                      if (role === 'admin') navigate('/admin/complaints');
                      else if (role === 'staff') navigate('/staff/tasks');
                      else navigate('/student/notifications');
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
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-card border border-surface-border shadow-popover z-50 py-1 animate-slide-up text-xs">
                <div className="px-3 py-2.5 border-b border-surface-border">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                      {role}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(getProfileLink());
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surface-100 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>
                    {role === 'admin' ? 'Manage Directory' : role === 'staff' ? 'My Performance' : 'My Profile'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(getProfileSettingsLink());
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surface-100 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{role === 'admin' ? 'Campus Config' : 'Preferences'}</span>
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
      {isTrackModalOpen && (
        <QuickTrackModal
          isOpen={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
        />
      )}
    </>
  );
}

export default Topbar;
