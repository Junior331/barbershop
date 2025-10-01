import { api } from './api';

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  service?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    barberShop: {
      id: string;
      name: string;
    };
  };
  barberShop: {
    id: string;
    name: string;
  };
}

export const promotionsService = {
  // Promoções da semana para home
  async getWeekPromotions(): Promise<Promotion[]> {
    const response = await api.get('/promotions/week');
    return response.data;
  },

  // Todas as promoções
  async getAll(): Promise<Promotion[]> {
    const response = await api.get('/promotions');
    return response.data;
  },

  // Buscar promoção por ID
  async getById(id: string): Promise<Promotion> {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },
};