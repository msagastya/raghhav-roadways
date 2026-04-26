'use client';

import { useEffect } from 'react';
import ErrorBoundary from '../shared/ErrorBoundary';
import useThemeStore from '../../store/themeStore';

export default function RootProviders({ children }) {
  const initializeTheme = useThemeStore((s) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
