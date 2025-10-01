import { useState } from 'react';
import { motion } from 'framer-motion';

import { getIcons } from '@/assets/icons';
import { cn } from '@/utils/utils';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = 0; // Hardcoded for now

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleNotifications}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Bell Icon */}
        <motion.img
          src={getIcons('profile')}
          alt="Notificações"
          className="w-6 h-6"
        />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel - Disabled for now */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white border rounded-lg shadow-lg p-4">
          <p className="text-gray-500">Nenhuma notificação</p>
        </div>
      )}
    </div>
  );
};