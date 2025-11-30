'use client';

import ErrorBoundary from '../shared/ErrorBoundary';

export default function RootProviders({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
