import { api } from './api';

export interface CreateAppointmentData {
  barberId: string;
  serviceId: string;
  barberShopId: string;
  scheduledTo: string; // ISO date
  scheduledTime: string; // "09:00"
  totalPrice: number;
  paymentMethod: 'CREDIT' | 'DEBIT' | 'PIX' | 'WALLET';
}

export interface Appointment {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  barberShopId: string;
  scheduledTo: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  totalPrice: number;
  discountAmount: number;
  paymentMethod?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  canCancelFree: boolean;
  createdAt: string;
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
    phone?: string;
  };
  barber: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
  barberShop: {
    id: string;
    name: string;
    address: string;
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const appointmentsService = {
  // Criar agendamento
  async create(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Histórico do cliente
  async getMyHistory(page = 1, limit = 10): Promise<PaginatedResponse<Appointment>> {
    const response = await api.get('/appointments/my-history', {
      params: { page, limit }
    });
    return response.data;
  },

  // Agendamentos ativos do cliente
  async getMyActiveAppointments(): Promise<Appointment[]> {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  // Editar agendamento (apenas PENDING)
  async update(id: string, data: { scheduledTo?: string; scheduledTime?: string }): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  },

  // Cancelar agendamento
  async cancel(id: string): Promise<{ message: string; cancellationFee: number; canCancelFree: boolean }> {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Agendamentos do barbeiro
  async getBarberAppointments(): Promise<Appointment[]> {
    const response = await api.get('/appointments/barber/my-appointments');
    return response.data;
  },

  // Confirmar agendamento (barbeiro)
  async confirm(id: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Recusar agendamento (barbeiro)
  async reject(id: string, reason?: string): Promise<{ message: string }> {
    const response = await api.patch(`/appointments/${id}/reject`, { reason });
    return response.data;
  },

  // Completar agendamento (barbeiro)
  async complete(id: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },
};