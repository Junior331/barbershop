import { api, ApiUtils, PaginatedResponse as BasePaginatedResponse } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

export interface Barber {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  barberShop?: {
    id: string;
    name: string;
  };
  totalAppointments: number;
  averageRating: number;
  totalReviews: number;
}

export interface BarberWithServices extends Barber {
  serviceBarbers: {
    service: {
      id: string;
      name: string;
      description?: string;
      price: number;
      durationMinutes: number;
      imageUrl?: string;
    };
  }[];
}

export interface AvailableTime {
  time: string;
  available: boolean;
  formatted: string;
}

export interface AvailableTimesResponse {
  date: string;
  dayOfWeek: number;
  dayName: string;
  available: boolean;
  times: AvailableTime[];
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  message?: string;
}

// Usar o tipo base de paginação da API
export type PaginatedResponse<T> = BasePaginatedResponse<T>;

export const barbersService = {
  // Barbeiros para home (com estatísticas)
  async getForHome(limit = 10): Promise<Barber[]> {
    try {
      logger.info('Buscando barbeiros para home:', { limit });

      const response = await api.get('/users/barbers/for-home', {
        params: { limit }
      });

      logger.info(`Encontrados ${response.data.length} barbeiros para home`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'barbersService.getForHome');
      throw error;
    }
  },

  // Todos os barbeiros
  async getAll(): Promise<Barber[]> {
    try {
      logger.info('Buscando todos os barbeiros');

      const response = await api.get('/users/barbers');

      logger.info(`Encontrados ${response.data.length} barbeiros`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'barbersService.getAll');
      throw error;
    }
  },

  // Barbeiros por barbearia
  async getByBarberShop(barberShopId: string): Promise<BarberWithServices[]> {
    try {
      logger.info('Buscando barbeiros por barbearia:', { barberShopId });

      const response = await api.get(`/users/barbers/barber-shop/${barberShopId}`);

      logger.info(`Encontrados ${response.data.length} barbeiros na barbearia ${barberShopId}`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'barbersService.getByBarberShop');
      throw error;
    }
  },

  // Barbeiros que fazem determinados serviços
  async getByServices(serviceIds: string[], page = 1, limit = 20): Promise<PaginatedResponse<BarberWithServices>> {
    try {
      logger.info('Buscando barbeiros por serviços:', {
        serviceIds,
        page,
        limit,
        servicesCount: serviceIds.length
      });

      const response = await api.post('/users/barbers/by-services',
        { serviceIds },
        { params: { page, limit } }
      );

      logger.info(`Encontrados ${response.data.data?.length || 0} barbeiros que fazem os serviços solicitados`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'barbersService.getByServices');
      throw error;
    }
  },

  // Horários disponíveis de um barbeiro
  async getAvailableTimes(barberId: string, date: string, serviceDuration: number): Promise<AvailableTimesResponse> {
    try {
      logger.info('Buscando horários disponíveis:', {
        barberId,
        date,
        serviceDuration
      });

      const response = await api.get(`/working-hours/barber/${barberId}/available-times`, {
        params: { date, serviceDuration }
      });

      logger.info('Horários encontrados:', {
        barberId,
        date,
        totalSlots: response.data.totalSlots,
        availableSlots: response.data.availableSlots,
        occupiedSlots: response.data.occupiedSlots,
        isAvailable: response.data.available
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'barbersService.getAvailableTimes');
      throw error;
    }
  },

  // Função utilitária para formatar informações do barbeiro
  getBarberDisplayInfo(barber: Barber): {
    name: string;
    rating: string;
    appointments: string;
    experience: string;
  } {
    return {
      name: barber.name,
      rating: barber.averageRating > 0
        ? `${barber.averageRating.toFixed(1)} ⭐ (${barber.totalReviews} avaliações)`
        : 'Sem avaliações',
      appointments: `${barber.totalAppointments} agendamentos`,
      experience: barber.totalAppointments > 100
        ? 'Experiente'
        : barber.totalAppointments > 50
          ? 'Intermediário'
          : 'Iniciante'
    };
  },

  // Verificar se barbeiro está disponível para agendamento
  isAvailableForBooking(availableTimesResponse: AvailableTimesResponse): boolean {
    return availableTimesResponse.available && availableTimesResponse.availableSlots > 0;
  },

  // Obter próximo horário disponível
  getNextAvailableTime(availableTimesResponse: AvailableTimesResponse): AvailableTime | null {
    if (!availableTimesResponse.available || !availableTimesResponse.times) {
      return null;
    }

    return availableTimesResponse.times.find(time => time.available) || null;
  },

  // Filtrar barbeiros por rating mínimo
  filterByMinRating(barbers: Barber[], minRating: number): Barber[] {
    return barbers.filter(barber => barber.averageRating >= minRating);
  },

  // Ordenar barbeiros por critério
  sortBarbers(barbers: Barber[], sortBy: 'rating' | 'appointments' | 'name' = 'rating'): Barber[] {
    return [...barbers].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'appointments':
          return b.totalAppointments - a.totalAppointments;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  },
};