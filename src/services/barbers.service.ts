import { api } from './api';

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

export const barbersService = {
  // Barbeiros para home (com estatísticas)
  async getForHome(limit = 10): Promise<Barber[]> {
    const response = await api.get('/users/barbers/for-home', {
      params: { limit }
    });
    return response.data;
  },

  // Todos os barbeiros
  async getAll(): Promise<Barber[]> {
    const response = await api.get('/users/barbers');
    return response.data;
  },

  // Barbeiros por barbearia
  async getByBarberShop(barberShopId: string): Promise<BarberWithServices[]> {
    const response = await api.get(`/users/barbers/barber-shop/${barberShopId}`);
    return response.data;
  },

  // Barbeiros que fazem determinados serviços
  async getByServices(serviceIds: string[], page = 1, limit = 20): Promise<{
    data: BarberWithServices[];
    pagination: any;
  }> {
    const response = await api.post('/users/barbers/by-services',
      { serviceIds },
      { params: { page, limit } }
    );
    return response.data;
  },

  // Horários disponíveis de um barbeiro
  async getAvailableTimes(barberId: string, date: string, serviceDuration: number): Promise<AvailableTimesResponse> {
    const response = await api.get(`/working-hours/barber/${barberId}/available-times`, {
      params: { date, serviceDuration }
    });
    return response.data;
  },
};