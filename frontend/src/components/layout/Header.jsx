'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import Button from '../ui/button';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.header
      className="bg-gradient-to-r from-white via-gray-50/30 to-white border-b-2 border-gray-200/50 sticky top-0 z-30 backdrop-blur-md shadow-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 shadow-md hover:shadow-lg focus:outline-none transition-all"
            whileHover={{ scale: 1.05, rotate: 90, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring' }}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>

          {/* App Name on Mobile */}
          <motion.h1
            className="block sm:hidden text-sm font-bold text-primary-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Raghhav Roadways
          </motion.h1>
        </div>

        <motion.div
          className="flex items-center gap-2 sm:gap-3 lg:gap-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* User Info */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50/50 transition-all"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-900">{user?.fullName || user?.username}</p>
              <p className="text-xs text-gray-500">{user?.roleName}</p>
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
    </motion.header>
  );
}
