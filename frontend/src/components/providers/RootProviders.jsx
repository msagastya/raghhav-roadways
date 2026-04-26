'use client';

import { useEffect } from 'react';
import SmartErrorBoundary from '../shared/SmartErrorBoundary';
import useThemeStore from '../../store/themeStore';

export default function RootProviders({ children }) {
  const initializeTheme = useThemeStore((s) => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <SmartErrorBoundary>
      {children}
    </SmartErrorBoundary>
  );
}
