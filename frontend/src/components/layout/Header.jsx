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
      <header
        className="glass-header sticky top-0 z-30"
      >
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-xl bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border-2 border-white/20 dark:border-white/10 focus:outline-none transition-all"
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

          <div
            className="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
          >
            {/* Search Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border-2 border-white/20 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/40 dark:bg-white/10 border border-white/30 dark:border-white/10 rounded text-[10px] font-semibold">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden p-2 rounded-lg bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border-2 border-white/20 dark:border-white/10 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Voice Command Button */}
            {isSupported && (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all border-2 ${
                  isListening
                    ? 'bg-red-500/20 dark:bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse shadow-lg shadow-red-500/30 border-red-400/30'
                    : 'bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 text-gray-600 dark:text-gray-400 border-white/20 dark:border-white/10'
                }`}
                title={isListening ? 'Stop listening' : 'Voice command'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border-2 border-white/20 dark:border-white/10 text-gray-600 dark:text-gray-400 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Info */}
            <div
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-all"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.roleName}</p>
              </div>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/50"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

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
          </div>
        </div>

        {/* Voice Transcript Bar */}
        {isListening && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-2 bg-red-500/10 dark:bg-red-500/10 border-t border-red-300/30 dark:border-red-500/20"
          >
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Listening: "{transcript}"
            </p>
          </motion.div>
        )}
      </header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
