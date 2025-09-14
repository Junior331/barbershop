import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  joinAppointmentRoom: (appointmentId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectSocket = useCallback(() => {
    if (!token || socket?.connected) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Erro de conexão WebSocket:', error);
      setIsConnected(false);

      // Tentar reconectar após um delay
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔌 Tentando reconectar...');
          newSocket.connect();
        }, 5000);
      }
    });

    // Listener para notificações gerais
    newSocket.on('notification', (notification: Notification) => {
      console.log('📢 Nova notificação:', notification);

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Mostrar toast apenas para notificações importantes
      if (['APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED'].includes(notification.type)) {
        toast.success(notification.title, {
          duration: 5000,
          position: 'top-right',
        });
      }
    });

    // Listener para notificações não lidas (ao conectar)
    newSocket.on('unread_notifications', (unreadNotifications: Notification[]) => {
      console.log('📢 Notificações não lidas:', unreadNotifications);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    });

    // Listener para atualizações de agendamento
    newSocket.on('appointment_update', (update: any) => {
      console.log('📅 Atualização de agendamento:', update);

      toast.success(`Agendamento ${update.status}`, {
        duration: 4000,
        position: 'top-right',
      });

      // Aqui você pode adicionar lógica para atualizar o estado global dos agendamentos
    });

    // Listener para usuário digitando (para chat futuro)
    newSocket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('✏️ Usuário digitando:', data);
      // Implementar lógica de typing indicator
    });

    // Listener para broadcasts gerais
    newSocket.on('broadcast', (message: any) => {
      console.log('📢 Broadcast:', message);
      toast.info(message.title || 'Nova mensagem', {
        duration: 6000,
      });
    });

    setSocket(newSocket);

    return newSocket;
  }, [token]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setNotifications([]);
      setUnreadCount(0);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [socket]);

  const joinAppointmentRoom = useCallback((appointmentId: string) => {
    if (socket && isConnected) {
      socket.emit('join_appointment_room', { appointmentId });
    }
  }, [socket, isConnected]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_notification_as_read', { notificationId });

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [socket, isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Conectar quando tiver token
  useEffect(() => {
    if (token && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [token, user, connectSocket, disconnectSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, [disconnectSocket]);

  return {
    socket,
    isConnected,
    notifications,
    unreadCount,
    joinAppointmentRoom,
    markNotificationAsRead,
    clearNotifications,
  };
};