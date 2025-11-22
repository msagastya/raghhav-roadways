'use client';

import dynamic from 'next/dynamic';

// Loading component for lazy loaded modules
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Lazy load heavy components
export const CommandPalette = dynamic(
  () => import('../shared/CommandPalette'),
  { loading: LoadingSpinner, ssr: false }
);

export const ErrorBoundary = dynamic(
  () => import('../shared/ErrorBoundary'),
  { ssr: false }
);

// Lazy load chart components (if any)
export const ReportCharts = dynamic(
  () => import('../reports/ReportCharts').catch(() => ({ default: () => null })),
  { loading: LoadingSpinner, ssr: false }
);

// Lazy load PDF viewer
export const PDFViewer = dynamic(
  () => import('../shared/PDFViewer').catch(() => ({ default: () => null })),
  { loading: LoadingSpinner, ssr: false }
);

// Lazy load Excel export modal
export const ExportModal = dynamic(
  () => import('../shared/ExportModal').catch(() => ({ default: () => null })),
  { loading: LoadingSpinner, ssr: false }
);
