import { api, ApiUtils, PaginatedResponse } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

// Tipos para serviços baseados na API real
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  barberShopId: string;
  createdAt: string;
  updatedAt: string;
  barberShop?: {
    id: string;
    name: string;
    address: string;
  };
  serviceBarbers?: ServiceBarber[];
  promotions?: Promotion[];
}

export interface ServiceBarber {
  id: string;
  serviceId: string;
  barberId: string;
  barber: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  barberShopId: string;
  imageUrl?: string;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  imageUrl?: string;
}

export interface ServiceFilters {
  barberShopId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BarbersByServicesData {
  serviceIds: string[];
  barberShopId?: string;
}

// Interface para exibição (com cálculos de preço)
export interface ServiceDisplay extends Service {
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
  promotion?: Promotion;
}

export const servicesService = {
  // Listar todos os serviços
  async getAll(filters?: ServiceFilters): Promise<PaginatedResponse<Service> | Service[]> {
    try {
      logger.info('Buscando serviços:', filters);

      const params = new URLSearchParams();
      if (filters?.barberShopId) params.append('barberShopId', filters.barberShopId);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/services?${queryString}` : '/services';

      const response = await api.get(url);

      logger.info(`Encontrados ${Array.isArray(response.data) ? response.data.length : response.data.data?.length || 0} serviços`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.getAll');
      throw error;
    }
  },

  // Serviços para seleção (interface simplificada)
  async getForSelection(): Promise<Service[]> {
    try {
      logger.info('Buscando serviços para seleção');

      const response = await api.get('/services/for-selection');

      logger.info(`Encontrados ${response.data.length} serviços para seleção`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.getForSelection');
      throw error;
    }
  },

  // Serviços por barbearia
  async getByBarberShop(barberShopId: string): Promise<Service[]> {
    try {
      logger.info('Buscando serviços por barbearia:', { barberShopId });

      const response = await api.get(`/services/barber-shop/${barberShopId}`);

      logger.info(`Encontrados ${response.data.length} serviços na barbearia`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.getByBarberShop');
      throw error;
    }
  },

  // Buscar barbeiros por serviços
  async getBarbersByServices(data: BarbersByServicesData) {
    try {
      logger.info('Buscando barbeiros por serviços:', data);

      const response = await api.post('/users/barbers/by-services', data);

      logger.info(`Encontrados ${response.data.length} barbeiros disponíveis`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.getBarbersByServices');
      throw error;
    }
  },

  // Obter serviço por ID
  async getById(id: string): Promise<Service> {
    try {
      logger.info('Buscando serviço por ID:', { id });

      const response = await api.get(`/services/${id}`);

      logger.info('Serviço encontrado:', { serviceId: response.data.id, name: response.data.name });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.getById');
      throw error;
    }
  },

  // Converter Service para ServiceDisplay (com cálculos de preço)
  transformToDisplay(service: Service, promotions: Promotion[] = []): ServiceDisplay {
    const activePromotion = promotions.find(p =>
      p.serviceId === service.id &&
      p.isActive &&
      new Date(p.startDate) <= new Date() &&
      new Date(p.endDate) >= new Date()
    );

    const discountPercentage = activePromotion?.discountPercentage || 0;
    const finalPrice = service.price * (1 - discountPercentage / 100);

    return {
      ...service,
      barbersCount: service.serviceBarbers?.length || 0,
      barbers: service.serviceBarbers?.map(sb => sb.barber) || [],
      pricing: {
        originalPrice: service.price,
        finalPrice,
        discountPercentage,
        hasDiscount: discountPercentage > 0,
      },
      promotion: activePromotion,
    };
  },

  // Criar novo serviço (apenas para admin/barber)
  async create(data: CreateServiceData): Promise<Service> {
    try {
      logger.info('Criando novo serviço:', { name: data.name, price: data.price });

      const response = await api.post('/services', data);

      logger.info('Serviço criado com sucesso:', { serviceId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.create');
      throw error;
    }
  },

  // Criar múltiplos serviços
  async createBulk(services: CreateServiceData[]): Promise<Service[]> {
    try {
      logger.info('Criando serviços em lote:', { count: services.length });

      const response = await api.post('/services/bulk', { services });

      logger.info('Serviços criados com sucesso:', { count: response.data.length });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.createBulk');
      throw error;
    }
  },

  // Atualizar serviço
  async update(id: string, data: UpdateServiceData): Promise<Service> {
    try {
      logger.info('Atualizando serviço:', { id, data });

      const response = await api.patch(`/services/${id}`, data);

      logger.info('Serviço atualizado com sucesso:', { serviceId: response.data.id });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.update');
      throw error;
    }
  },

  // Deletar serviço
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deletando serviço:', { id });

      await api.delete(`/services/${id}`);

      logger.info('Serviço deletado com sucesso:', { id });
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'servicesService.delete');
      throw error;
    }
  },
};