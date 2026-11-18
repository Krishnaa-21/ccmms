import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Button from '../ui/Button.jsx';
import QuickTrackModal from '../common/QuickTrackModal.jsx';
import { ShieldCheck, Moon, Sun, Search, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-surface-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Institutional Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-900 dark:bg-primary-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  CCMMS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  Apex Campus
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Facilities & Maintenance Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#problems" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
              Problems We Solve
            </a>
            <a href="#faq" className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Quick Track Button */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-3.5 h-3.5" />}
              onClick={() => setIsTrackOpen(true)}
              className="hidden sm:inline-flex text-xs"
            >
              Track Ticket
            </Button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-surface-100 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user.role === 'admin') navigate('/admin/dashboard');
                  else if (user.role === 'staff') navigate('/staff/tasks');
                  else navigate('/student/dashboard');
                }}
              >
                Go to Portal
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-surface-border bg-surface-card space-y-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              FAQ
            </a>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                leftIcon={<Search className="w-4 h-4" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsTrackOpen(true);
                }}
              >
                Track a Complaint
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Track Modal */}
      <QuickTrackModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </>
  );
}

export default Navbar;
