'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SHORTCUTS = {
  // Navigation (Alt + Key)
  'alt+h': { route: '/', description: 'Go to Dashboard' },
  'alt+c': { route: '/consignments', description: 'Go to Consignments' },
  'alt+i': { route: '/invoices', description: 'Go to Invoices' },
  'alt+p': { route: '/payments', description: 'Go to Payments' },
  'alt+a': { route: '/parties', description: 'Go to Parties' },
  'alt+v': { route: '/vehicles', description: 'Go to Vehicles' },
  'alt+m': { route: '/masters', description: 'Go to Masters' },
  'alt+r': { route: '/reports', description: 'Go to Reports' },
  'alt+s': { route: '/settings', description: 'Go to Settings' },

  // Quick actions (Ctrl + Key)
  'ctrl+shift+c': { route: '/consignments/new', description: 'New Consignment' },
  'ctrl+shift+i': { route: '/invoices/new', description: 'New Invoice' },
  'ctrl+shift+p': { route: '/payments/new', description: 'New Payment' },
};

export default function useKeyboardShortcuts({ onSearch, onToggleTheme } = {}) {
  const router = useRouter();

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
      // Allow Escape to blur input
      if (event.key === 'Escape') {
        event.target.blur();
      }
      return;
    }

    const key = [];
    if (event.ctrlKey || event.metaKey) key.push('ctrl');
    if (event.altKey) key.push('alt');
    if (event.shiftKey) key.push('shift');
    key.push(event.key.toLowerCase());

    const shortcut = key.join('+');

    // Check navigation shortcuts
    if (SHORTCUTS[shortcut]) {
      event.preventDefault();
      router.push(SHORTCUTS[shortcut].route);
      return;
    }

    // Global search (Ctrl/Cmd + K)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      onSearch?.();
      return;
    }

    // Toggle theme (Ctrl/Cmd + D)
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      onToggleTheme?.();
      return;
    }

    // Go back (Alt + Left Arrow)
    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      router.back();
      return;
    }

    // Go forward (Alt + Right Arrow)
    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      router.forward();
      return;
    }

    // Show shortcuts help (?)
    if (event.key === '?' && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      // Could trigger a modal here
      console.log('Shortcuts:', SHORTCUTS);
      return;
    }
  }, [router, onSearch, onToggleTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts: SHORTCUTS };
}
