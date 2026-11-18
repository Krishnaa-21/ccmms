import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, PlusCircle, Wrench, QrCode, FileText, Bell, Users, BarChart3, Mail, Moon, Sun, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'student' || (!isAdmin && !isStaff);

  const allItems = [
    // Universal Actions
    {
      id: 'public-issues',
      title: 'Public Campus Issues Board',
      category: 'Public Transparency',
      icon: Compass,
      action: () => navigate('/issues')
    },
    {
      id: 'new-report',
      title: 'Submit New Complaint / Work Order',
      category: 'Actions',
      icon: PlusCircle,
      action: () => navigate('/student/complaints/new')
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },

    // Student Links
    ...(user
      ? [
          {
            id: 'my-complaints',
            title: 'My Submitted Complaints',
            category: 'Student Portal',
            icon: FileText,
            action: () => navigate('/student/complaints')
          },
          {
            id: 'notifications',
            title: 'Campus Notifications & Alerts',
            category: 'Account',
            icon: Bell,
            action: () => navigate('/student/notifications')
          }
        ]
      : []),

    // Admin Tools
    ...(isAdmin
      ? [
          {
            id: 'admin-dash',
            title: 'Admin Executive Dashboard & Analytics',
            category: 'Administration',
            icon: BarChart3,
            action: () => navigate('/admin/dashboard')
          },
          {
            id: 'admin-queue',
            title: 'Triage & Review Queue',
            category: 'Administration',
            icon: ShieldAlert,
            action: () => navigate('/admin/queue')
          },
          {
            id: 'admin-qr',
            title: 'Location QR Codes & Label Sheets',
            category: 'Facilities Operations',
            icon: QrCode,
            action: () => navigate('/admin/qr-codes')
          },
          {
            id: 'admin-prev',
            title: 'Preventive Maintenance Plans',
            category: 'Facilities Operations',
            icon: Wrench,
            action: () => navigate('/admin/preventive')
          },
          {
            id: 'admin-messages',
            title: 'Simulated Notification Outbox (Email/SMS)',
            category: 'System & Audit',
            icon: Mail,
            action: () => navigate('/admin/messages')
          },
          {
            id: 'admin-workload',
            title: 'Staff Workload Balancer & Dispatch',
            category: 'Administration',
            icon: Users,
            action: () => navigate('/admin/workload')
          },
          {
            id: 'admin-users',
            title: 'Campus Directory & User Accounts',
            category: 'Administration',
            icon: Users,
            action: () => navigate('/admin/users')
          }
        ]
      : []),

    // Staff Tools
    ...(isStaff
      ? [
          {
            id: 'staff-tasks',
            title: 'My Assigned Work Orders',
            category: 'Staff Operations',
            icon: Wrench,
            action: () => navigate('/staff/tasks')
          },
          {
            id: 'staff-schedule',
            title: '7-Day Maintenance Schedule',
            category: 'Staff Operations',
            icon: FileText,
            action: () => navigate('/staff/schedule')
          },
          {
            id: 'staff-perf',
            title: 'My Performance Scorecard & Badges',
            category: 'Staff Operations',
            icon: BarChart3,
            action: () => navigate('/staff/performance')
          }
        ]
      : [])
  ];

  // Filtering
  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    setIsOpen(false);
    item.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to page... (e.g. 'QR', 'Preventive', 'Issues')"
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching pages or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.category}</div>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span>Apex CCMMS Quick Command</span>
        </div>
      </div>
    </div>
  );
}
