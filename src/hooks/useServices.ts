import { useState, useEffect } from "react";
import { servicesService } from "@/services/services.service";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotionalPrice?: number;
  durationMinutes: number;
  imageUrl?: string;
  isActive: boolean;
  discount?: number;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Carregando serviços na página Services');

      // Buscar todos os serviços ativos
      const response = await servicesService.getAll(); // Buscar todos os serviços

      // Filtrar apenas serviços ativos
      const responseData = 'data' in response ? response.data : response;
      const activeServices = responseData?.filter((service: any) => service.isActive) || [];

      // Calcular desconto para serviços com preço promocional
      const servicesWithDiscount = activeServices.map((service: any) => {
        let discount = 0;
        if (service.promotionalPrice && service.promotionalPrice < service.price) {
          discount = Math.round(((service.price - service.promotionalPrice) / service.price) * 100);
        }

        return {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.promotionalPrice || service.price, // Usar preço promocional se disponível
          promotionalPrice: service.promotionalPrice,
          durationMinutes: service.durationMinutes,
          imageUrl: service.imageUrl,
          isActive: service.isActive,
          discount: discount > 0 ? discount : undefined,
        };
      });

      setServices(servicesWithDiscount);
      logger.info(`Carregados ${servicesWithDiscount.length} serviços ativos`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar serviços';
      logger.error('Erro ao carregar serviços:', err);
      setError(errorMessage);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const refreshServices = async () => {
    await fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    error,
    loading,
    services,
    isLoading,
    setIsLoading,
    refreshServices,
    hasServices: services.length > 0,
  };
};
