'use client';

import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Home, FileText, Receipt, CreditCard, Users, Truck, Database,
  BarChart3, Settings, Plus, Moon, Sun, Mic, MicOff, Command, ArrowRight,
  X, Keyboard
} from 'lucide-react';
import useVoiceCommand from '../../hooks/useVoiceCommand';
import useThemeStore from '../../store/themeStore';

const ACTIONS = [
  // Navigation
  { id: 'dashboard', name: 'Go to Dashboard', icon: Home, type: 'navigation', route: '/', keywords: ['home', 'main'] },
  { id: 'consignments', name: 'Go to Consignments', icon: FileText, type: 'navigation', route: '/consignments', keywords: ['bilty', 'lr'] },
  { id: 'invoices', name: 'Go to Invoices', icon: Receipt, type: 'navigation', route: '/invoices', keywords: ['bills'] },
  { id: 'payments', name: 'Go to Payments', icon: CreditCard, type: 'navigation', route: '/payments', keywords: ['money'] },
  { id: 'parties', name: 'Go to Parties', icon: Users, type: 'navigation', route: '/parties', keywords: ['clients', 'customers'] },
  { id: 'vehicles', name: 'Go to Vehicles', icon: Truck, type: 'navigation', route: '/vehicles', keywords: ['trucks'] },
  { id: 'masters', name: 'Go to Masters', icon: Database, type: 'navigation', route: '/masters', keywords: ['data'] },
  { id: 'reports', name: 'Go to Reports', icon: BarChart3, type: 'navigation', route: '/reports', keywords: ['analytics'] },
  { id: 'settings', name: 'Go to Settings', icon: Settings, type: 'navigation', route: '/settings', keywords: ['config'] },

  // Quick Actions
  { id: 'new-consignment', name: 'Create New Consignment', icon: Plus, type: 'action', route: '/consignments/new', keywords: ['add', 'bilty'] },
  { id: 'new-invoice', name: 'Create New Invoice', icon: Plus, type: 'action', route: '/invoices/new', keywords: ['add', 'bill'] },
  { id: 'new-payment', name: 'Record New Payment', icon: Plus, type: 'action', route: '/payments/new', keywords: ['add', 'money'] },

  // Theme
  { id: 'toggle-theme', name: 'Toggle Dark Mode', icon: Moon, type: 'theme', keywords: ['light', 'dark', 'night'] },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const { toggleTheme, theme } = useThemeStore();
  const { isListening, toggleListening, isSupported, transcript } = useVoiceCommand();

  const filteredActions = query === ''
    ? ACTIONS
    : ACTIONS.filter((action) => {
        const searchText = `${action.name} ${action.keywords?.join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const executeAction = useCallback((action) => {
    if (action.type === 'theme') {
      toggleTheme();
    } else if (action.route) {
      router.push(action.route);
    }
    onClose();
  }, [router, toggleTheme, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        executeAction(filteredActions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredActions, selectedIndex, executeAction, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="flex min-h-full items-start justify-center p-4 pt-[15vh]">
          <motion.div
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Input */}
            <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700">
              <Search className="absolute left-4 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, pages, or type a command..."
                className="w-full bg-transparent py-4 pl-12 pr-20 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-4 flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                    }`}
                    title="Voice command"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="px-2">
                  {filteredActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => executeAction(action)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          index === selectedIndex
                            ? 'bg-primary-100 dark:bg-primary-800'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{action.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{action.type}</p>
                        </div>
                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-primary-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold">esc</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold">K</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
