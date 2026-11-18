import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import { Building2, Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your campus email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate recovery token dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions generated');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold font-serif text-slate-900 dark:text-white block leading-tight">
                Apex CCMMS
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Apex Institute of Technology</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Account Recovery
          </h1>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            Reset access to your campus complaint and maintenance portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. aarav.cse@apex.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                </div>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Enter the email address registered with your student or staff ID.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={loading}
              >
                <span>Send Reset Instructions</span>
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  Recovery Email Dispatched
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We have forwarded password reset instructions to:
                </p>
                <p className="mt-1 font-semibold text-sm text-primary-700 dark:text-primary-400">
                  {email}
                </p>
              </div>

              {/* Demo Sandbox Alert */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-left text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong className="font-semibold">Demo Sandbox Environment:</strong>
                  <p className="mt-0.5">
                    For all seeded accounts (Student, Admin, Staff), default password is <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[11px]">Password@123</code>. You can log in directly without resetting.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setSubmitted(false)}
                >
                  Try Another Email
                </Button>
                <Link to="/login">
                  <Button variant="primary" size="md" fullWidth>
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
