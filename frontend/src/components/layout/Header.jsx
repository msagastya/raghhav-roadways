'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, LogOut, Search, Mic, MicOff, Command } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import useVoiceCommand from '../../hooks/useVoiceCommand';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import CommandPalette from '../shared/CommandPalette';
import { cn } from '../../lib/utils';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isListening, toggleListening, isSupported, transcript } = useVoiceCommand();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setCommandPaletteOpen(true),
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

  const userInitial = (user?.fullName || user?.username || 'U')[0].toUpperCase();

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-md border-b border-primary-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-primary-500/30 text-primary-500 shadow-[0_0_10px_rgba(0,255,136,0.2)] focus:outline-none transition-all"
              whileHover={{ scale: 1.05, rotate: 90, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, type: 'spring' }}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* App Name on Mobile */}
            <motion.h1
              className="block sm:hidden text-sm font-orbitron font-bold text-primary-500 tracking-wider"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              RAGHHAV ROADWAYS
            </motion.h1>
          </div>

          <div
            className="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
          >
            {/* Search Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg neon-input text-slate-300 text-sm"
            >
              <Search className="w-4 h-4 text-primary-500" />
              <span className="hidden lg:inline tracking-wider">SEARCH...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-primary-500 ml-2">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden p-2 rounded-lg neon-input"
            >
              <Search className="w-4 h-4 text-primary-500" />
            </button>

            {/* Voice Command Button */}
            {isSupported && (
              <button
                onClick={toggleListening}
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isListening
                    ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-slate-900 text-brand-500 border-brand-500/30 hover:border-brand-500/60 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                )}
                title={isListening ? 'Stop listening' : 'Voice command'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* User Info */}
            <div
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-primary-500/20"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">{user?.fullName || user?.username}</p>
                <p className="text-[10px] text-primary-500 font-orbitron tracking-widest uppercase">{user?.roleName}</p>
              </div>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900 border border-primary-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.3)] relative"
              >
                <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-neon-pulse" />
                <span className="text-primary-500 font-orbitron font-bold text-sm sm:text-base relative z-10">{userInitial}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all font-orbitron text-xs sm:text-sm uppercase tracking-wider"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Voice Transcript Bar */}
        {isListening && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-2 bg-slate-900 border-t border-red-500/30"
          >
            <p className="text-sm text-red-400 flex items-center gap-2 font-orbitron tracking-wide">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
              LISTENING: "{transcript}"
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
