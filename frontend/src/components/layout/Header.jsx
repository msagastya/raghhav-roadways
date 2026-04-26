'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, LogOut, User, Search, Mic, MicOff, Moon, Sun, Command } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import api from '../../lib/api';
import useThemeStore from '../../store/themeStore';
import useVoiceCommand from '../../hooks/useVoiceCommand';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import CommandPalette from '../shared/CommandPalette';
import Breadcrumb from './Breadcrumb';
import NotificationBell from './NotificationBell';
import Button from '../ui/button';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme, initializeTheme } = useThemeStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isListening, toggleListening, isSupported, transcript } = useVoiceCommand();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeTheme();
  }, [initializeTheme]);

  useKeyboardShortcuts({
    onSearch: () => setCommandPaletteOpen(true),
    onToggleTheme: toggleTheme
  });

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

  const searchPlaceholders = [
    'Search GR numbers...',
    'Find parties...',
    'Search vehicles...',
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore — clearing cookies anyway
    }
    logout();
    window.location.href = '/login';
  };

  if (!mounted) return null;

  return (
    <>
      {/* Header — glass-t4 (always dark forest green) */}
      <motion.header
        className="glass-t4 sticky top-0 z-40 border-b border-white/8 h-14"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Accent bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

        <div className="h-full flex items-center justify-between px-3 sm:px-6">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white flex-shrink-0 md:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <div className="hidden sm:block min-w-0">
              <Breadcrumb />
            </div>
          </div>

          {/* Center: Search Bar */}
          <motion.div
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mx-4 flex-shrink-0 w-96 max-w-md focus-within:border-primary-500/50 cursor-pointer"
            whileTap={{ scale: 0.98 }}
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
            <span className="flex-1 text-sm text-white/40 select-none">
              {searchPlaceholders[placeholderIdx]}
            </span>
            <kbd className="text-xs text-white/40 px-2 py-0.5 bg-white/5 border border-white/10 rounded flex-shrink-0">
              Cmd K
            </kbd>
          </motion.div>

          {/* Right: Actions */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Mobile Search */}
            <motion.button
              onClick={() => setCommandPaletteOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Search"
            >
              <Search className="w-4 h-4" />
            </motion.button>

            {/* Voice Command */}
            {isSupported && (
              <motion.button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isListening ? 'Stop listening' : 'Voice command'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* User Pill */}
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer ml-1"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs text-white/60">{user?.roleName}</p>
              </div>
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1 }}
              >
                <User className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1 !px-2 sm:!px-3 text-white hover:bg-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Logout</span>
            </Button>
          </motion.div>
        </div>

        {/* Voice Transcript Bar */}
        {isListening && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-2 bg-red-500/10 border-t border-red-500/20"
          >
            <p className="text-sm text-red-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Listening: &ldquo;{transcript}&rdquo;
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
