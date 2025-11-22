'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Truck,
  FileText,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Plus,
  Moon,
  Sun,
  Keyboard,
  X,
  ChevronRight
} from 'lucide-react';
import useUIStore from '@/store/uiStore';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

const COMMANDS = [
  // Navigation
  { id: 'dashboard', name: 'Go to Dashboard', icon: Home, action: 'navigate', path: '/', category: 'Navigation' },
  { id: 'consignments', name: 'Go to Consignments', icon: Truck, action: 'navigate', path: '/consignments', category: 'Navigation' },
  { id: 'invoices', name: 'Go to Invoices', icon: FileText, action: 'navigate', path: '/invoices', category: 'Navigation' },
  { id: 'payments', name: 'Go to Payments', icon: CreditCard, action: 'navigate', path: '/payments', category: 'Navigation' },
  { id: 'reports', name: 'Go to Reports', icon: BarChart3, action: 'navigate', path: '/reports', category: 'Navigation' },
  { id: 'parties', name: 'Go to Parties', icon: Users, action: 'navigate', path: '/parties', category: 'Navigation' },
  { id: 'vehicles', name: 'Go to Vehicles', icon: Truck, action: 'navigate', path: '/vehicles', category: 'Navigation' },
  { id: 'masters', name: 'Go to Masters', icon: Settings, action: 'navigate', path: '/masters', category: 'Navigation' },
  { id: 'settings', name: 'Go to Settings', icon: Settings, action: 'navigate', path: '/settings', category: 'Navigation' },

  // Quick Actions
  { id: 'new-consignment', name: 'Create New Consignment', icon: Plus, action: 'navigate', path: '/consignments/new', category: 'Quick Actions' },
  { id: 'new-invoice', name: 'Create New Invoice', icon: Plus, action: 'navigate', path: '/invoices/new', category: 'Quick Actions' },
  { id: 'new-payment', name: 'Record New Payment', icon: Plus, action: 'navigate', path: '/payments/new', category: 'Quick Actions' },

  // UI Actions
  { id: 'toggle-dark', name: 'Toggle Dark Mode', icon: Moon, action: 'toggle-dark', category: 'Settings' },
  { id: 'toggle-sidebar', name: 'Toggle Sidebar', icon: ChevronRight, action: 'toggle-sidebar', category: 'Settings' },
  { id: 'keyboard-shortcuts', name: 'Show Keyboard Shortcuts', icon: Keyboard, action: 'show-shortcuts', category: 'Help' },
];

export default function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { commandPaletteOpen, setCommandPaletteOpen, toggleDarkMode, toggleSidebar, darkMode } = useUIStore();

  // Filter commands based on search
  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Handle command execution
  const executeCommand = useCallback((command) => {
    switch (command.action) {
      case 'navigate':
        router.push(command.path);
        break;
      case 'toggle-dark':
        toggleDarkMode();
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'show-shortcuts':
        setShowShortcuts(true);
        return; // Don't close palette
    }
    setCommandPaletteOpen(false);
    setSearch('');
  }, [router, toggleDarkMode, toggleSidebar, setCommandPaletteOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (showShortcuts) {
            setShowShortcuts(false);
          } else {
            setCommandPaletteOpen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, executeCommand, setCommandPaletteOpen, showShortcuts]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPaletteOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      setShowShortcuts(false);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Command Palette Modal */}
        <motion.div
          className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
        >
          {showShortcuts ? (
            // Keyboard Shortcuts View
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Command Search View
            <>
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                />
                <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(groupedCommands).length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No commands found
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {commands.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const Icon = command.icon;
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={command.id}
                            onClick={() => executeCommand(command)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                            <span className="flex-1 text-sm">{command.name}</span>
                            {command.id === 'toggle-dark' && (
                              <span className="text-xs text-gray-400">
                                {darkMode ? 'Light' : 'Dark'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↵</kbd>
                    select
                  </span>
                </div>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  Shortcuts
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
