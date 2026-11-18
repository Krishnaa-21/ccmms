import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Bell, User, Wrench, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../context/NotificationContext.jsx';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isStaff = user.role === 'staff';

  const dashboardPath = isAdmin ? '/admin/dashboard' : isStaff ? '/staff/dashboard' : '/student/dashboard';
  const listPath = isAdmin ? '/admin/complaints' : isStaff ? '/staff/tasks' : '/student/complaints';
  const listLabel = isAdmin ? 'Tickets' : isStaff ? 'Tasks' : 'Reports';
  const ListIcon = isAdmin ? ShieldAlert : isStaff ? Wrench : FileText;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Dashboard */}
        <NavLink
          to={dashboardPath}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* List / Tasks */}
        <NavLink
          to={listPath}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <ListIcon className="w-5 h-5 mb-0.5" />
          <span>{listLabel}</span>
        </NavLink>

        {/* Center Action (New Complaint) */}
        <NavLink
          to="/student/complaints/new"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/30 border-4 border-white dark:border-slate-900 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1">Report</span>
        </NavLink>

        {/* Notifications */}
        <NavLink
          to="/student/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span>Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
