import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/authApi.js';
import { Button } from '../../components/ui/Button.jsx';
import { PasswordInput } from '../../components/ui/Input.jsx';
import {
  User,
  Mail,
  Building2,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  '#1e3a8a', // Navy
  '#0d9488', // Teal
  '#b45309', // Amber
  '#4338ca', // Indigo
  '#0f766e', // Cyan
  '#be185d', // Rose
  '#15803d'  // Emerald
];

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#1e3a8a');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPass(true);
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveColor = (color) => {
    setSelectedColor(color);
    if (user) {
      const updated = { ...user, avatarColor: color };
      updateUserProfile(updated);
      toast.success('Profile accent color updated');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          My Account & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your institutional credentials, department affiliation, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Profile Badge Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center space-y-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-serif mx-auto shadow-md"
              style={{ backgroundColor: selectedColor }}
            >
              {user?.name?.[0] || 'U'}
            </div>

            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                {user?.name || 'Campus Student'}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 uppercase tracking-wider inline-block mt-1">
                {user?.role || 'student'}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user?.department || 'Apex Institute'}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Campus Verification: Active</span>
              </div>
            </div>

            {/* Avatar Accent Color Customizer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Profile Accent Tone
              </span>
              <div className="flex items-center justify-between">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSaveColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedColor === c ? 'ring-2 ring-primary-600 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2/3): Password Security & Policies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Change Account Password
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Ensure your password has at least 6 characters and includes alphanumeric characters.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password *
                </label>
                <PasswordInput
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password *
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isChangingPass}
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Institutional Data Protection Notice */}
          <div className="p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary-900 dark:text-primary-200">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Campus Digital Security & Privacy</span>
            </div>
            <p className="leading-relaxed">
              Your profile is bound to the Apex Institute directory. Maintenance complaints logged through this portal are preserved as official campus audit records. In case of transfer or department change, request an administrator update through the Estate Office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

