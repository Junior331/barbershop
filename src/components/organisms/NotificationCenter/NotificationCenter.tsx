import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getIcons } from '@/assets/icons';
import { cn } from '@/utils/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { notificationsService, Notification } from '@/services/notifications.service';
import { CircleIcon, Text, Title } from '@/components/elements';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const navigate = useNavigate();
  const { notifications: realtimeNotifications, markNotificationAsRead } = useWebSocket();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Carregar notificações quando o centro for aberto
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1);
    }
  }, [isOpen]);

  // Mesclar notificações em tempo real com as carregadas
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setAllNotifications(prev => {
        const newNotifications = [...realtimeNotifications];

        // Remove duplicatas baseado no ID
        prev.forEach(existing => {
          if (!newNotifications.find(n => n.id === existing.id)) {
            newNotifications.push(existing);
          }
        });

        return newNotifications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
  }, [realtimeNotifications]);

  const loadNotifications = async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications(pageNum, 20);

      if (append) {
        setAllNotifications(prev => [...prev, ...response.data]);
      } else {
        setAllNotifications(response.data);
      }

      setHasMore(response.meta.page < response.meta.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida se não estiver
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
      await notificationsService.markAsRead(notification.id);
    }

    // Obter ação da notificação e navegar
    const action = notificationsService.getNotificationAction(notification);
    if (action) {
      onClose();
      navigate(action.path);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setAllNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  const groupedNotifications = notificationsService.groupNotificationsByDate(allNotifications);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div>
                <Title className="text-lg">Notificações</Title>
                <Text className="text-sm text-gray-600">
                  {allNotifications.filter(n => !n.isRead).length} não lidas
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-[#6C8762] hover:underline"
                >
                  Marcar todas como lidas
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img
                    src={getIcons('close')}
                    alt="Fechar"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {allNotifications.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <img
                    src={getIcons('notifications')}
                    alt="Sem notificações"
                    className="w-16 h-16 opacity-50 mb-4"
                  />
                  <Title className="text-gray-500 mb-2">Nenhuma notificação</Title>
                  <Text className="text-gray-400 text-center">
                    Você receberá notificações sobre seus agendamentos aqui
                  </Text>
                </div>
              ) : (
                <div>
                  {Object.entries(groupedNotifications).map(([dateGroup, notifications]) => (
                    <div key={dateGroup}>
                      {/* Date Header */}
                      <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b">
                        <Text className="text-sm font-medium text-gray-600">
                          {dateGroup}
                        </Text>
                      </div>

                      {/* Notifications for this date */}
                      <div>
                        {notifications.map((notification) => {
                          const action = notificationsService.getNotificationAction(notification);

                          return (
                            <motion.div
                              key={notification.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                'p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors',
                                !notification.isRead && 'bg-blue-50 border-l-4 border-l-[#6C8762]'
                              )}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={cn(
                                  'p-2 rounded-full flex-shrink-0',
                                  notificationsService.isImportantNotification(notification.type)
                                    ? 'bg-[#6C8762] bg-opacity-20'
                                    : 'bg-gray-100'
                                )}>
                                  <img
                                    src={getIcons(notificationsService.getNotificationIcon(notification.type))}
                                    alt="Notification"
                                    className={cn(
                                      'w-5 h-5',
                                      notificationsService.getNotificationColor(notification.type)
                                    )}
                                  />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <Title className={cn(
                                      'text-sm font-medium truncate',
                                      !notification.isRead && 'text-gray-900',
                                      notification.isRead && 'text-gray-700'
                                    )}>
                                      {notification.title}
                                    </Title>
                                    <Text className="text-xs text-gray-500 flex-shrink-0">
                                      {notificationsService.formatNotificationTime(notification.createdAt)}
                                    </Text>
                                  </div>

                                  <Text className={cn(
                                    'text-sm mt-1 line-clamp-2',
                                    !notification.isRead && 'text-gray-800',
                                    notification.isRead && 'text-gray-600'
                                  )}>
                                    {notification.message}
                                  </Text>

                                  {/* Appointment info if available */}
                                  {notification.appointment && (
                                    <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded">
                                      <CircleIcon className="!w-8 !h-8">
                                        <img
                                          src={notification.appointment.service.imageUrl || getIcons('fallback')}
                                          alt={notification.appointment.service.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </CircleIcon>
                                      <div className="flex-1 min-w-0">
                                        <Text className="text-xs font-medium truncate">
                                          {notification.appointment.service.name}
                                        </Text>
                                        <Text className="text-xs text-gray-600">
                                          {new Date(notification.appointment.scheduledTo).toLocaleDateString('pt-BR')} às {notification.appointment.scheduledTime}
                                        </Text>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action button */}
                                  {action && (
                                    <button className="text-xs text-[#6C8762] hover:underline mt-2">
                                      {action.text}
                                    </button>
                                  )}
                                </div>

                                {/* Unread indicator */}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-[#6C8762] rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Load more button */}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="text-sm text-[#6C8762] hover:underline disabled:opacity-50"
                      >
                        {loading ? 'Carregando...' : 'Carregar mais'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};