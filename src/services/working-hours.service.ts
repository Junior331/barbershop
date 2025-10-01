import { api, ApiUtils } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

export interface WorkingHour {
  id: string;
  barberId: string;
  dayOfWeek: number; // 0 = domingo, 1 = segunda, etc
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableTimeSlot {
  time: string; // "14:30"
  available: boolean;
  formatted?: string;
  availableBarbers?: number;
  availableBarbersIds?: string[];
}

export interface AvailableSlotsResponse {
  date: string;
  dayOfWeek: number;
  dayName: string;
  available: boolean;
  times: AvailableTimeSlot[];
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
}

export interface CreateWorkingHourData {
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface AvailableTimesParams {
  date: string; // "2025-01-15"
  barberIds?: string[];
  serviceIds?: string[];
}

export const workingHoursService = {
  // Criar horário de trabalho
  async create(data: CreateWorkingHourData): Promise<WorkingHour> {
    try {
      logger.info('Criando horário de trabalho:', data);

      const response = await api.post('/working-hours', data);

      logger.info('Horário de trabalho criado:', { id: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.create');
      throw error;
    }
  },

  // Criar múltiplos horários para um barbeiro
  async createMultiple(barberId: string, workingHours: Omit<CreateWorkingHourData, 'barberId'>[]): Promise<WorkingHour[]> {
    try {
      logger.info('Criando múltiplos horários de trabalho:', { barberId, count: workingHours.length });

      const response = await api.post(`/working-hours/barber/${barberId}/multiple`, {
        workingHours
      });

      logger.info(`${response.data.length} horários criados para barbeiro ${barberId}`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.createMultiple');
      throw error;
    }
  },

  // Listar todos os horários
  async getAll(): Promise<WorkingHour[]> {
    try {
      logger.info('Buscando todos os horários de trabalho');

      const response = await api.get('/working-hours');

      logger.info(`Encontrados ${response.data.length} horários de trabalho`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.getAll');
      throw error;
    }
  },

  // Buscar horários por barbeiro
  async getByBarber(barberId: string): Promise<WorkingHour[]> {
    try {
      logger.info('Buscando horários do barbeiro:', { barberId });

      const response = await api.get(`/working-hours/barber/${barberId}`);

      logger.info(`Encontrados ${response.data.length} horários para o barbeiro`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.getByBarber');
      throw error;
    }
  },

  // Buscar horário específico
  async getById(id: string): Promise<WorkingHour> {
    try {
      logger.info('Buscando horário por ID:', { id });

      const response = await api.get(`/working-hours/${id}`);

      logger.info('Horário encontrado:', { id: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.getById');
      throw error;
    }
  },

  // Atualizar horário
  async update(id: string, data: Partial<CreateWorkingHourData>): Promise<WorkingHour> {
    try {
      logger.info('Atualizando horário:', { id, data });

      const response = await api.patch(`/working-hours/${id}`, data);

      logger.info('Horário atualizado:', { id: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.update');
      throw error;
    }
  },

  // Remover horário
  async delete(id: string): Promise<{ message: string }> {
    try {
      logger.info('Removendo horário:', { id });

      const response = await api.delete(`/working-hours/${id}`);

      logger.info('Horário removido:', { id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.delete');
      throw error;
    }
  },

  // Buscar horários disponíveis para um barbeiro em uma data específica
  async getAvailableTimes(barberId: string, date: string): Promise<AvailableSlotsResponse> {
    try {
      logger.info('Buscando horários disponíveis:', { barberId, date });

      const response = await api.get(`/working-hours/barber/${barberId}/available-times`, {
        params: { date }
      });

      logger.info(`Encontrados ${response.data.times?.length || 0} horários disponíveis`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.getAvailableTimes');
      throw error;
    }
  },

  // Buscar slots disponíveis para múltiplos barbeiros (NOVO endpoint!)
  async getAvailableSlots(params: AvailableTimesParams): Promise<AvailableSlotsResponse> {
    try {
      logger.info('Buscando slots disponíveis:', params);

      const response = await api.post('/working-hours/available-slots', params);

      logger.info(`Encontrados ${response.data.times?.length || 0} slots disponíveis`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'workingHoursService.getAvailableSlots');
      throw error;
    }
  },

  // Função utilitária para converter número do dia da semana para nome
  getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek] || 'Dia inválido';
  },

  // Função utilitária para formatar horário
  formatTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
      return time;
    }
  },

  // Verificar se horário está no formato correto
  isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Verificar se dia da semana é válido
  isValidDayOfWeek(day: number): boolean {
    return day >= 0 && day <= 6;
  }
};