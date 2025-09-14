import { api } from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data: any;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    scheduledTo: string;
    scheduledTime: string;
    service: {
      name: string;
      imageUrl?: string;
    };
    barber: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  };
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

class NotificationsService {
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString(),
    });

    const response = await api.get(`/notifications?${params}`);
    return response.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Métodos de conveniência para trabalhar com notificações

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
        return 'check_circle';
      case 'APPOINTMENT_CANCELLED':
        return 'cancel';
      case 'APPOINTMENT_REMINDER':
        return 'schedule';
      case 'APPOINTMENT_COMPLETED':
        return 'done';
      case 'PAYMENT_SUCCESS':
        return 'payment';
      case 'PAYMENT_FAILED':
        return 'error';
      case 'PAYMENT_REFUND':
        return 'refund';
      case 'PROMOTION':
        return 'local_offer';
      case 'NEW_BARBER':
        return 'person_add';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
      case 'PAYMENT_SUCCESS':
      case 'APPOINTMENT_COMPLETED':
        return 'text-green-600';
      case 'APPOINTMENT_CANCELLED':
      case 'PAYMENT_FAILED':
        return 'text-red-600';
      case 'APPOINTMENT_REMINDER':
        return 'text-yellow-600';
      case 'PROMOTION':
        return 'text-purple-600';
      case 'NEW_BARBER':
      case 'PAYMENT_REFUND':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Agora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return `${diffInDays} dias atrás`;
    } else {
      return notificationTime.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  // Método para agrupar notificações por data
  groupNotificationsByDate(notifications: Notification[]): { [key: string]: Notification[] } {
    const groups: { [key: string]: Notification[] } = {};

    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;

      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ontem';
      } else {
        groupKey = date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long'
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(notification);
    });

    return groups;
  }

  // Método para verificar se uma notificação é importante
  isImportantNotification(type: string): boolean {
    const importantTypes = [
      'APPOINTMENT_CONFIRMED',
      'APPOINTMENT_CANCELLED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'APPOINTMENT_REMINDER'
    ];

    return importantTypes.includes(type);
  }

  // Método para obter ação da notificação
  getNotificationAction(notification: Notification): { text: string; path: string } | null {
    switch (notification.type) {
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_CANCELLED':
      case 'APPOINTMENT_REMINDER':
        return {
          text: 'Ver Agendamento',
          path: `/mybookings`
        };
      case 'APPOINTMENT_COMPLETED':
        return {
          text: 'Avaliar Serviço',
          path: `/review/${notification.appointment?.id}`
        };
      case 'PROMOTION':
        return {
          text: 'Ver Promoção',
          path: '/services'
        };
      case 'NEW_BARBER':
        return {
          text: 'Ver Barbeiros',
          path: '/barbers'
        };
      case 'PAYMENT_FAILED':
        return {
          text: 'Tentar Novamente',
          path: `/payment/${notification.data?.appointmentId}`
        };
      default:
        return null;
    }
  }
}

export const notificationsService = new NotificationsService();