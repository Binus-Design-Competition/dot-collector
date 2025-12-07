import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Usually reloading the page fixes this.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Reload Page
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
               <div className="mt-8 text-left">
                  <details className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-slate-900/50 p-4 rounded overflow-auto max-h-48">
                      <summary className="font-semibold cursor-pointer mb-2">Error Details</summary>
                      {this.state.error.toString()}
                  </details>
               </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
