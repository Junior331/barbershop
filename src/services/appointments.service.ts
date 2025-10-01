import { api, ApiUtils, PaginatedResponse as BasePaginatedResponse } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

export interface CreateAppointmentData {
  clientId?: string; // Opcional, o backend pode pegar do token
  barberId: string;
  serviceId: string;
  barberShopId: string;
  scheduledTo: string; // ISO date
  totalPrice: number;
  paymentMethod?: 'CREDIT' | 'DEBIT' | 'PIX' | 'WALLET';
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  notes?: string;
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

// Usar o tipo base de paginação da API
export type PaginatedResponse<T> = BasePaginatedResponse<T>;

export const appointmentsService = {
  // Criar agendamento
  async create(data: CreateAppointmentData): Promise<Appointment> {
    try {
      logger.info('Criando agendamento:', {
        barberId: data.barberId,
        serviceId: data.serviceId,
        scheduledTo: data.scheduledTo,
        totalPrice: data.totalPrice,
      });

      const response = await api.post('/appointments', data);

      logger.info('Agendamento criado com sucesso:', { appointmentId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.create');
      throw error;
    }
  },

  // Histórico do cliente
  async getMyHistory(page = 1, limit = 10): Promise<PaginatedResponse<Appointment>> {
    try {
      logger.info('Buscando histórico de agendamentos:', { page, limit });

      const response = await api.get('/appointments/my-history', {
        params: { page, limit }
      });

      logger.info(`Encontrados ${response.data.data?.length || 0} agendamentos no histórico`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.getMyHistory');
      throw error;
    }
  },

  // Agendamentos ativos do cliente
  async getMyActiveAppointments(): Promise<Appointment[]> {
    try {
      logger.info('Buscando agendamentos ativos');

      const response = await api.get('/appointments/my-appointments');

      logger.info(`Encontrados ${response.data.length} agendamentos ativos`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.getMyActiveAppointments');
      throw error;
    }
  },

  // Obter agendamento específico
  async getById(id: string): Promise<Appointment> {
    try {
      logger.info('Buscando agendamento por ID:', { id });

      const response = await api.get(`/appointments/${id}`);

      logger.info('Agendamento encontrado:', { appointmentId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.getById');
      throw error;
    }
  },

  // Editar agendamento (apenas PENDING)
  async update(id: string, data: { scheduledTo?: string; scheduledTime?: string }): Promise<Appointment> {
    try {
      logger.info('Atualizando agendamento:', { id, data });

      const response = await api.patch(`/appointments/${id}`, data);

      logger.info('Agendamento atualizado com sucesso:', { appointmentId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.update');
      throw error;
    }
  },

  // Cancelar agendamento pelo cliente
  async cancelByClient(id: string): Promise<{ message: string; cancellationFee: number; canCancelFree: boolean }> {
    try {
      logger.info('Cancelando agendamento pelo cliente:', { id });

      const response = await api.delete(`/appointments/${id}/cancel-by-client`);

      logger.info('Agendamento cancelado pelo cliente:', {
        appointmentId: id,
        fee: response.data.cancellationFee,
        canCancelFree: response.data.canCancelFree,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.cancelByClient');
      throw error;
    }
  },

  // Cancelar agendamento
  async cancel(id: string): Promise<{ message: string; cancellationFee: number; canCancelFree: boolean }> {
    try {
      logger.info('Cancelando agendamento:', { id });

      const response = await api.delete(`/appointments/${id}`);

      logger.info('Agendamento cancelado:', {
        appointmentId: id,
        fee: response.data.cancellationFee,
        canCancelFree: response.data.canCancelFree,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.cancel');
      throw error;
    }
  },

  // Agendamentos do barbeiro
  async getBarberAppointments(): Promise<Appointment[]> {
    try {
      logger.info('Buscando agendamentos do barbeiro');

      const response = await api.get('/appointments/barber/my-appointments');

      logger.info(`Barbeiro tem ${response.data.length} agendamentos`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.getBarberAppointments');
      throw error;
    }
  },

  // Buscar agendamentos por barbeiro e data específica
  async getBarberAppointmentsByDate(barberId: string, date: string): Promise<Appointment[]> {
    try {
      logger.info('Buscando agendamentos do barbeiro por data:', { barberId, date });

      const response = await api.get('/appointments/barber/my-appointments', {
        params: { date }
      });

      // Filtrar agendamentos para a data específica
      const appointments = response.data.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.scheduledTo);
        const targetDate = new Date(date);
        return appointmentDate.toDateString() === targetDate.toDateString();
      });

      logger.info(`Encontrados ${appointments.length} agendamentos para ${date}`);

      return appointments;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.getBarberAppointmentsByDate');
      throw error;
    }
  },

  // Confirmar agendamento (barbeiro)
  async confirm(id: string): Promise<Appointment> {
    try {
      logger.info('Confirmando agendamento:', { id });

      const response = await api.patch(`/appointments/${id}/confirm`);

      logger.info('Agendamento confirmado:', { appointmentId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.confirm');
      throw error;
    }
  },

  // Recusar agendamento (barbeiro)
  async reject(id: string, reason?: string): Promise<{ message: string }> {
    try {
      logger.info('Recusando agendamento:', { id, reason });

      const response = await api.patch(`/appointments/${id}/reject`, { reason });

      logger.info('Agendamento recusado:', { appointmentId: id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.reject');
      throw error;
    }
  },

  // Completar agendamento (barbeiro)
  async complete(id: string): Promise<Appointment> {
    try {
      logger.info('Completando agendamento:', { id });

      const response = await api.patch(`/appointments/${id}/complete`);

      logger.info('Agendamento completado:', { appointmentId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'appointmentsService.complete');
      throw error;
    }
  },

  // Função utilitária para formatar status
  getStatusDisplay(status: string): { label: string; color: string; bgColor: string } {
    const statusMap = {
      PENDING: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      CONFIRMED: { label: 'Confirmado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      COMPLETED: { label: 'Concluído', color: 'text-green-700', bgColor: 'bg-green-100' },
      CANCELLED: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
      EXPIRED: { label: 'Expirado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  },

  // Verificar se agendamento pode ser cancelado
  canCancel(appointment: Appointment): boolean {
    return ['PENDING', 'CONFIRMED'].includes(appointment.status);
  },

  // Verificar se agendamento pode ser editado
  canEdit(appointment: Appointment): boolean {
    return appointment.status === 'PENDING';
  },
};