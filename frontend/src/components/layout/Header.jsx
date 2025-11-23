'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, LogOut, User, Search, Mic, MicOff, Moon, Sun, Command, Keyboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import useThemeStore from '../../store/themeStore';
import useVoiceCommand from '../../hooks/useVoiceCommand';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import CommandPalette from '../shared/CommandPalette';
import Button from '../ui/button';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme, initializeTheme } = useThemeStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isListening, toggleListening, isSupported, transcript } = useVoiceCommand();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setCommandPaletteOpen(true),
    onToggleTheme: toggleTheme
  });

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <motion.header
        className="bg-gradient-to-r from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 border-b-2 border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30 backdrop-blur-md shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-md hover:shadow-lg focus:outline-none transition-all"
              whileHover={{ scale: 1.05, rotate: 90, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, type: 'spring' }}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>

            {/* App Name on Mobile */}
            <motion.h1
              className="block sm:hidden text-sm font-bold text-primary-600 dark:text-primary-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Raghhav Roadways
            </motion.h1>
          </div>

          <motion.div
            className="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Search Button */}
            <motion.button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-[10px] font-semibold shadow-sm">
                <Command className="w-3 h-3" />K
              </kbd>
            </motion.button>

            {/* Mobile Search Icon */}
            <motion.button
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Voice Command Button */}
            {isSupported && (
              <motion.button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse shadow-lg shadow-red-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isListening ? 'Stop listening' : 'Voice command'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* User Info */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.roleName}</p>
              </div>
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/50"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
            </motion.div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 !px-2 sm:!px-3"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Logout</span>
            </Button>
          </motion.div>
        </div>

        {/* Voice Transcript Bar */}
        {isListening && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Listening: "{transcript}"
            </p>
          </motion.div>
        )}
      </motion.header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
