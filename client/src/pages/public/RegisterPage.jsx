import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, PasswordInput } from '../../components/ui/Input.jsx';
import {
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Building2,
  Phone,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Management Studies',
  'Department of Physics & Chemistry',
  'Department of Mathematics',
  'Campus Administration & Staff'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    role: 'student',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const strengthScore = getPasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (formData.password.length === 0) return { label: '', color: 'bg-slate-200' };
    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score <= 4) return { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { label: 'Strong', color: 'bg-teal-600', text: 'text-teal-700' };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.department) errs.department = 'Department is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must acknowledge the campus usage guidelines';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        role: formData.role,
        password: formData.password
      });
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete registration';
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Column: Campus Heritage Banner */}
      <div className="lg:w-5/12 bg-primary-950 text-white flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden">
        {/* Subtle geometric pattern backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary-700/20 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary-900/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif tracking-tight text-white block">Apex CCMMS</span>
              <span className="text-xs text-primary-300 font-sans tracking-widest uppercase">Apex Institute of Technology</span>
            </div>
          </Link>

          <div className="mt-14 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/60 border border-primary-800 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Official Campus Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">
              Join the Apex Campus Care Network
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Create your institutional account to report facility concerns, track real-time resolution SLAs, receive instant SMS/SSE status alerts, and help keep our campus world-class.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Strict SLA Guarantees:</strong> 4-hr high-priority emergency target, 24-hr standard turnaround.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Transparent Lifecycle:</strong> Track your ticket from assignment to verification with technician notes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Direct Accountability:</strong> Rate work quality, submit comments, or reopen unaddressed tickets.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-8 border-t border-primary-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Apex Institute of Technology</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> Facilities & Works Dept
          </span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
              Create Student / Staff Account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-700 dark:text-primary-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Campus Affiliation
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'student' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    formData.role === 'student'
                      ? 'bg-primary-900 text-white border-primary-900 shadow-sm dark:bg-primary-600 dark:border-primary-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'staff' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    formData.role === 'staff'
                      ? 'bg-primary-900 text-white border-primary-900 shadow-sm dark:bg-primary-600 dark:border-primary-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Faculty / Staff
                </button>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Patel"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Campus Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@apex.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>
            </div>

            {/* Phone & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Branch *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="mt-1 text-xs text-rose-500">{errors.department}</p>}
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  error={errors.password}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Security Strength:</span>
                  <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i <= strengthScore ? strengthInfo.color : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Tip: Use uppercase letters, numbers, and symbols for enhanced security.
                </p>
              </div>
            )}

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                I agree to the{' '}
                <a href="#terms" className="text-primary-700 dark:text-primary-400 font-medium underline">
                  Campus Facilities Fair Usage Policy
                </a>{' '}
                and understand that maintenance tickets are subject to official verification.
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-rose-500">{errors.agreeTerms}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              className="mt-4"
            >
              <span>Create My Campus Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Note on Maintenance/Admin Roles */}
          <div className="mt-8 p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-slate-200">Are you an Administrator or Maintenance Staff?</strong>
              <p className="mt-0.5">
                Staff and Administrative accounts are provisioned exclusively by Campus Estate Administration. Please contact IT Helpdesk or sign in using institutional credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

