import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, PasswordInput } from '../../components/ui/Input.jsx';
import { ShieldCheck, ArrowRight, UserCheck, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Target destination after login
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await login(email.trim(), password);
      // Route appropriately based on user role
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff/tasks', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface-50 text-slate-900 dark:text-slate-100 transition-colors">
      {/* LEFT BRANDED PANEL (Institutional, subtle, calm) */}
      <div className="hidden lg:flex lg:col-span-5 bg-primary-950 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle geometric circle pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-white block">
                CCMMS
              </span>
              <span className="text-[11px] text-primary-300 uppercase tracking-wider font-semibold">
                Apex Institute of Technology
              </span>
            </div>
          </Link>

          <div className="pt-16 space-y-3">
            <h2 className="text-3xl font-extrabold font-heading text-white leading-snug">
              Welcome to the Campus Maintenance Portal
            </h2>
            <p className="text-sm text-primary-200 leading-relaxed max-w-sm">
              Log in to report repair requests, track active work orders in real time, and verify completion across all academic and residential buildings.
            </p>
          </div>

          <div className="space-y-3 pt-6 text-xs text-primary-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct ticket routing to certified technicians</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time milestone push notifications (SSE)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict SLA adherence & escalation monitoring</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-primary-400 pt-8 border-t border-primary-900/80">
          Estate Office & Facilities Helpdesk &bull; Main Campus
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Mobile branding header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-900 dark:bg-primary-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Apex CCMMS
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Enter your campus credentials to access the maintenance portal.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email Address"
              type="email"
              required
              placeholder="e.g. aarav.cse@apex.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />

            <PasswordInput
              label="Password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Remember this device</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-primary-700 dark:text-primary-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* 1-CLICK DEMO CREDENTIALS BOX */}
          <div className="p-4 rounded-xl border border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 space-y-2.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300 text-center">
              ⚡ 1-Click Quick Demo Sign In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('aarav.cse@apex.edu')}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-center hover:border-primary-500 hover:shadow-2xs transition-all text-xs group"
              >
                <UserCheck className="w-4 h-4 mx-auto text-primary-600 group-hover:scale-110 transition-transform mb-1" />
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">Student</span>
                <span className="block text-[9px] text-slate-400 truncate">Aarav Patel</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@apex.edu')}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-center hover:border-primary-500 hover:shadow-2xs transition-all text-xs group"
              >
                <Shield className="w-4 h-4 mx-auto text-blue-600 group-hover:scale-110 transition-transform mb-1" />
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">Admin</span>
                <span className="block text-[9px] text-slate-400 truncate">Dr. Sundaram</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('plumbing@apex.edu')}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-center hover:border-primary-500 hover:shadow-2xs transition-all text-xs group"
              >
                <Wrench className="w-4 h-4 mx-auto text-amber-600 group-hover:scale-110 transition-transform mb-1" />
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">Staff</span>
                <span className="block text-[9px] text-slate-400 truncate">Rajesh (Plumb)</span>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              Populates email & password (<code>Password@123</code>). Click "Sign In" to proceed.
            </p>
          </div>

          {/* Registration link */}
          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-700 dark:text-primary-400 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

