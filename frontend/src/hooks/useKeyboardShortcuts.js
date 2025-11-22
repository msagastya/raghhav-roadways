'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useUIStore from '@/store/uiStore';

const useKeyboardShortcuts = () => {
  const router = useRouter();
  const { toggleSidebar, toggleDarkMode, toggleCommandPalette } = useUIStore();

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // Allow Escape to blur inputs
      if (event.key === 'Escape') {
        target.blur();
      }
      return;
    }

    const { ctrlKey, metaKey, shiftKey, key } = event;
    const modKey = ctrlKey || metaKey;

    // Command Palette: Ctrl/Cmd + K
    if (modKey && key === 'k') {
      event.preventDefault();
      toggleCommandPalette();
      return;
    }

    // Navigation shortcuts (with Shift)
    if (shiftKey) {
      switch (key) {
        case 'D':
          event.preventDefault();
          router.push('/');
          break;
        case 'C':
          event.preventDefault();
          router.push('/consignments');
          break;
        case 'I':
          event.preventDefault();
          router.push('/invoices');
          break;
        case 'P':
          event.preventDefault();
          router.push('/payments');
          break;
        case 'R':
          event.preventDefault();
          router.push('/reports');
          break;
        case 'V':
          event.preventDefault();
          router.push('/vehicles');
          break;
        case 'M':
          event.preventDefault();
          router.push('/masters');
          break;
      }
      return;
    }

    // Quick actions (without modifier)
    switch (key) {
      // Toggle sidebar: [
      case '[':
        event.preventDefault();
        toggleSidebar();
        break;

      // Toggle dark mode: \
      case '\\':
        event.preventDefault();
        toggleDarkMode();
        break;

      // New consignment: n
      case 'n':
        if (!modKey) {
          event.preventDefault();
          router.push('/consignments/new');
        }
        break;

      // Search/Focus search: /
      case '/':
        event.preventDefault();
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
        break;

      // Escape: Close modals, clear search
      case 'Escape':
        const modal = document.querySelector('[data-modal]');
        if (modal) {
          const closeButton = modal.querySelector('[data-modal-close]');
          if (closeButton) closeButton.click();
        }
        break;

      // Go back: Backspace
      case 'Backspace':
        if (!modKey) {
          event.preventDefault();
          router.back();
        }
        break;
    }
  }, [router, toggleSidebar, toggleDarkMode, toggleCommandPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl/Cmd', 'K'], description: 'Open command palette' },
  { keys: ['Shift', 'D'], description: 'Go to Dashboard' },
  { keys: ['Shift', 'C'], description: 'Go to Consignments' },
  { keys: ['Shift', 'I'], description: 'Go to Invoices' },
  { keys: ['Shift', 'P'], description: 'Go to Payments' },
  { keys: ['Shift', 'R'], description: 'Go to Reports' },
  { keys: ['Shift', 'V'], description: 'Go to Vehicles' },
  { keys: ['Shift', 'M'], description: 'Go to Masters' },
  { keys: ['['], description: 'Toggle sidebar' },
  { keys: ['\\'], description: 'Toggle dark mode' },
  { keys: ['n'], description: 'New consignment' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['Esc'], description: 'Close modal / Clear search' },
  { keys: ['Backspace'], description: 'Go back' },
];
