import { api } from './api';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  barberShop: {
    id: string;
    name: string;
  };
  barbersCount: number;
  barbers: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  pricing: {
    originalPrice: number;
    finalPrice: number;
    discountPercentage: number;
    hasDiscount: boolean;
  };
  promotion?: {
    id: string;
    title: string;
    description?: string;
    discountPercentage: number;
  };
}

export const servicesService = {
  // Serviços para seleção (com promoções e barbeiros)
  async getForSelection(barberShopId?: string): Promise<Service[]> {
    const response = await api.get('/services/for-selection', {
      params: barberShopId ? { barberShopId } : undefined
    });
    return response.data;
  },

  // Listar todos os serviços
  async getAll(): Promise<Service[]> {
    const response = await api.get('/services');
    return response.data;
  },

  // Serviços de uma barbearia
  async getByBarberShop(barberShopId: string): Promise<Service[]> {
    const response = await api.get(`/services/barber-shop/${barberShopId}`);
    return response.data;
  },

  // Buscar serviço por ID
  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
};