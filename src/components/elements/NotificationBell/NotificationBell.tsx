import { useState } from 'react';
import { motion } from 'framer-motion';

import { getIcons } from '@/assets/icons';
import { cn } from '@/utils/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationCenter } from '@/components/organisms';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const { unreadCount } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          'relative p-2 rounded-full hover:bg-gray-100 transition-colors',
          className
        )}
      >
        {/* Bell Icon */}
        <motion.img
          src={getIcons('notifications')}
          alt="Notificações"
          className="w-6 h-6"
          animate={unreadCount > 0 ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{
            duration: 0.5,
            repeat: unreadCount > 0 ? Infinity : 0,
            repeatDelay: 5,
          }}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};