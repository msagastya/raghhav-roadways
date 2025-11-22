'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../hooks/useAuth';

/**
 * ProtectedRoute - Component to protect routes based on authentication and permissions
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.permission - Required permission(s) to access the route
 * @param {boolean} props.requireAll - If true, requires all permissions (default: false, requires any)
 * @param {React.ReactNode} props.fallback - Custom loading component
 * @param {string} props.redirectTo - Custom redirect path (default: /login)
 */
export default function ProtectedRoute({
  children,
  permission,
  requireAll = false,
  fallback,
  redirectTo = '/login'
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions if required
  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user?.permissions || [];

    const hasPermission = requireAll
      ? requiredPermissions.every(p => userPermissions.includes(p))
      : requiredPermissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            You don&apos;t have permission to access this page. Please contact your administrator.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  return children;
}

/**
 * withProtection - HOC to wrap pages with protection
 */
export function withProtection(Component, options = {}) {
  return function ProtectedPage(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
