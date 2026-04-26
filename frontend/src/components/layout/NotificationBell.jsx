'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, Clock, FileX } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - in real app, would fetch from API
  useEffect(() => {
    // Example notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'amendment',
        title: 'GR #12345 - Amendment Required',
        message: 'Consignment GR #12345 requires amendment for destination change',
        time: '2 hours ago',
        icon: AlertCircle,
        color: 'bg-orange-500/20 border-orange-500/30',
        badge: 'orange',
      },
      {
        id: 2,
        type: 'expiry',
        title: 'EWay Bill Expiring',
        message: '3 EWay Bills are expiring within 30 days',
        time: '5 hours ago',
        icon: Clock,
        color: 'bg-yellow-500/20 border-yellow-500/30',
        badge: 'yellow',
      },
      {
        id: 3,
        type: 'overdue',
        title: 'Overdue Invoice',
        message: 'Invoice INV-2024-001 is now overdue for 5 days',
        time: '1 day ago',
        icon: FileX,
        color: 'bg-red-500/20 border-red-500/30',
        badge: 'red',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.length);
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              className="absolute top-12 right-0 w-96 max-w-[calc(100vw-1rem)] glass-t3 rounded-lg border border-black/6 dark:border-white/10 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-black/6 dark:border-white/10 bg-white/60 dark:bg-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <motion.div
                          key={notif.id}
                          className={`p-3 hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors cursor-pointer border-l-2 border-transparent ${notif.color}`}
                          whileHover={{ x: 4 }}
                          onClick={() => setOpen(false)}
                        >
                          <div className="flex gap-3">
                            <motion.div
                              className={`p-2 rounded-lg flex-shrink-0 ${notif.color}`}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Icon className="w-4 h-4" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-white/50">No notifications</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-black/6 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center">
                  <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
