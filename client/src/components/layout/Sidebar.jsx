import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  UserCheck,
  BarChart3,
  Wrench,
  Calendar,
  Award,
  QrCode,
  RotateCw,
  Mail,
  Compass
} from 'lucide-react';

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'student';

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Complaints', path: '/admin/complaints', icon: ClipboardList },
        { label: 'Review Queue', path: '/admin/review-queue', icon: Sparkles, highlight: true },
        { label: 'QR Asset Codes', path: '/admin/qr-codes', icon: QrCode },
        { label: 'Preventive Plans', path: '/admin/preventive', icon: RotateCw },
        { label: 'Staff Workload', path: '/admin/workload', icon: Users },
        { label: 'Manage Users', path: '/admin/users', icon: UserCheck },
        { label: 'Reports & Export', path: '/admin/reports', icon: BarChart3 },
        { label: 'Sent Outbox', path: '/admin/messages', icon: Mail },
        { label: 'Campus Issues Board', path: '/issues', icon: Compass },
        { label: 'Campus Settings', path: '/admin/settings', icon: Settings }
      ];
    }

    if (role === 'staff') {
      return [
        { label: 'Today\'s Queue', path: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'My Work Orders', path: '/staff/tasks', icon: Wrench, highlight: true },
        { label: 'Due Schedule', path: '/staff/schedule', icon: Calendar },
        { label: 'My Scorecard', path: '/staff/performance', icon: Award }
      ];
    }

    // Default: student / requester
    return [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Complaints', path: '/student/complaints', icon: ClipboardList },
      { label: 'Report an Issue', path: '/student/new-complaint', icon: PlusCircle, highlight: true },
      { label: 'Notifications', path: '/student/notifications', icon: Bell },
      { label: 'My Profile', path: '/student/profile', icon: User },
      { label: 'Settings', path: '/student/settings', icon: Settings }
    ];
  };

  const navItems = getNavItems();

  const getPortalLabel = () => {
    if (role === 'admin') return 'Administration';
    if (role === 'staff') return 'Maintenance Desk';
    return 'Student Portal';
  };

  const getHomeRoute = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 bg-surface-card border-r border-surface-border flex flex-col justify-between transition-all duration-200 select-none shadow-sm',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
            <NavLink
              to={getHomeRoute()}
              className="flex items-center gap-3 overflow-hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-900 dark:bg-primary-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                    Apex CCMMS
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    {getPortalLabel()}
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-surface-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-900 dark:text-primary-300 font-semibold'
                        : item.highlight
                        ? 'text-primary-700 dark:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-950/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-surface-100 hover:text-slate-900 dark:hover:text-white'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform group-hover:scale-105',
                      item.highlight && 'text-primary-600 dark:text-primary-400'
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Quick Profile & Logout */}
        <div className="p-3 border-t border-surface-border space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-lg bg-surface-50 dark:bg-surface-100/60 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: user?.avatarColor || '#1e3a8a' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate flex-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name}
                </span>
                <span className="block text-[10px] text-primary-700 dark:text-primary-400 uppercase font-bold tracking-wider">
                  {role}
                  {user?.specialty ? ` • ${user.specialty}` : ''}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
