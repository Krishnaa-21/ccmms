import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { Button } from '../../components/ui/Button.jsx';
import {
  Moon,
  Sun,
  Bell,
  Sliders,
  Smartphone,
  Mail,
  Shield,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();

  // Notification toggles saved in localStorage
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('ccmms_notification_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          emailOnStatusChange: true,
          emailOnResolution: true,
          smsAlerts: false,
          desktopNotifications: true,
          weeklyDigest: false
        };
  });

  const handleToggle = (key) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('ccmms_notification_prefs', JSON.stringify(updated));
      return updated;
    });
    toast.success('Preference updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          Portal Preferences & Display
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize interface themes, real-time alert delivery channels, and campus support options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon className="w-5 h-5 text-teal-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              Visual Appearance
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Choose between institutional day theme and low-light dark theme for night study sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                !isDark
                  ? 'border-primary-600 bg-primary-50/50 shadow-sm ring-2 ring-primary-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Institutional Light
                  </span>
                  <span className="text-xs text-slate-500">Day mode with high contrast</span>
                </div>
              </div>
              {!isDark && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                isDark
                  ? 'border-teal-500 bg-slate-800 shadow-sm ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center border border-slate-700">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Campus Night Dark
                  </span>
                  <span className="text-xs text-slate-500">Muted tones for low-light</span>
                </div>
              </div>
              {isDark && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </button>
          </div>
        </div>

        {/* Notification Channel Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              Notification Channels
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Control which status updates trigger instant notifications and email dispatch.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                key: 'emailOnStatusChange',
                title: 'Status Change Alerts',
                desc: 'Receive alerts when your complaint is assigned or moved to In Progress',
                icon: Mail
              },
              {
                key: 'emailOnResolution',
                title: 'Resolution & Review Notifications',
                desc: 'Prompt notification as soon as work is marked resolved by the technician',
                icon: CheckCircle2
              },
              {
                key: 'desktopNotifications',
                title: 'Live Browser SSE Stream',
                desc: 'Show non-intrusive toast alerts while the campus portal is open in your browser',
                icon: Sliders
              },
              {
                key: 'smsAlerts',
                title: 'Emergency SMS Text Alerts',
                desc: 'Receive SMS messages for Critical and Hazard priority campus maintenance',
                icon: Smartphone
              }
            ].map(({ key, title, desc, icon: Icon }) => (
              <div key={key} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">{desc}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={() => handleToggle(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Facilities Support Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-serif text-white">
              Need assistance with an ongoing facility request?
            </h3>
            <p className="text-xs text-slate-300">
              Campus Facilities & Estate Management Helpdesk is available Monday - Saturday, 08:30 AM to 06:00 PM.
            </p>
          </div>
          <a
            href="mailto:facilities@apex.edu"
            className="shrink-0 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Contact Helpdesk
          </a>
        </div>
      </div>
    </div>
  );
}
