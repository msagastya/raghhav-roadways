'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Sparkles, Loader2 } from 'lucide-react';
import Button from '../ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2026/api/v1';

class SmartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      aiMessage: null,
      aiSuggestion: null,
      aiLoading: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    this.fetchAiExplanation(error, errorInfo);
  }

  async fetchAiExplanation(error, errorInfo) {
    if (!API_URL) return;

    this.setState({ aiLoading: true });

    try {
      const res = await fetch(`${API_URL}/ai/explain-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          errorMessage: error?.message || String(error),
          componentStack: errorInfo?.componentStack,
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        this.setState({
          aiMessage: data.userMessage || null,
          aiSuggestion: data.suggestion || null,
        });
      }
    } catch {
      // Silent — AI explanation is best-effort, never breaks the error UI
    } finally {
      this.setState({ aiLoading: false });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      aiMessage: null,
      aiSuggestion: null,
      aiLoading: false,
    });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { aiLoading, aiMessage, aiSuggestion, error, errorInfo } = this.state;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-2xl p-8 border border-red-100 dark:border-red-500/20">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2"
            >
              Oops! Something went wrong
            </motion.h1>

            {/* Claude AI Explanation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              {aiLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-white/50 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  <span>Claude is analysing the issue...</span>
                </div>
              ) : aiMessage ? (
                <div className="rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                      Claude's Analysis
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-white/80 mb-1">{aiMessage}</p>
                  {aiSuggestion && (
                    <p className="text-xs text-gray-600 dark:text-white/60 mt-2">
                      <span className="font-medium">Suggestion:</span> {aiSuggestion}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-white/60 text-center text-sm">
                  We've been notified and are working on it.
                </p>
              )}
            </motion.div>

            {/* Dev-only error details */}
            {process.env.NODE_ENV === 'development' && error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20"
              >
                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Error Details (Dev Mode):
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 font-mono break-all">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
}

export default SmartErrorBoundary;
