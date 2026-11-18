import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import Button from '../ui/Button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[CCMMS ErrorBoundary Caught Error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/student/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-surface-50 dark:bg-slate-950">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We encountered an issue while rendering this page. You can reload or return to the main portal.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left overflow-auto max-h-32 text-xs font-mono text-slate-700 dark:text-slate-300">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={this.handleReload}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reload
              </Button>
              <Button variant="primary" size="md" onClick={this.handleReset}>
                <Home className="w-4 h-4 mr-1.5" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

