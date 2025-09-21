import { useState, useEffect, useCallback } from "react";
import { barbersService, BarberWithServices } from "@/services/barbers.service";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

// Interface adaptada para compatibilidade com o componente existente
export interface AdaptedBarber {
  role: "barber";
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  barber_details: {
    id: string;
    description?: string;
    is_active: boolean;
    barber_rating: number;
  };
  services: string[];
  services_full: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
    image_url?: string;
  }>;
  total_price: number;
}

export const useBarbers = (serviceIds: string[]) => {
  const [barbers, setBarbers] = useState<AdaptedBarber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBarbers = useCallback(async () => {
    if (!serviceIds.length) {
      setBarbers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info('Buscando barbeiros por serviços:', { serviceIds });

      // Usar o novo serviço da API
      const response = await barbersService.getByServices(serviceIds, 1, 50);

      // Adaptar os dados para a interface existente
      const adaptedBarbers: AdaptedBarber[] = response.data?.map((barber: BarberWithServices) => {
        const services = barber.serviceBarbers.map(sb => sb.service);
        const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

        return {
          role: "barber" as const,
          id: barber.id,
          name: barber.name,
          email: undefined, // Não disponível no novo formato
          phone: undefined, // Não disponível no novo formato
          avatar_url: barber.avatarUrl,
          barber_details: {
            id: barber.id,
            description: undefined, // Não disponível no novo formato
            is_active: true, // Assumindo que barbeiros retornados estão ativos
            barber_rating: barber.averageRating || 0,
          },
          services: services.map(service => service.name),
          services_full: services.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            durationMinutes: service.durationMinutes,
            image_url: service.imageUrl,
          })),
          total_price: totalPrice,
        };
      }) || [];

      setBarbers(adaptedBarbers);
      logger.info(`Encontrados ${adaptedBarbers.length} barbeiros que fazem os serviços selecionados`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar barbeiros';
      logger.error("Erro ao buscar barbeiros:", err);
      setError(errorMessage);
      toast.error('Erro ao carregar barbeiros');
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  }, [serviceIds]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  return {
    barbers,
    loading,
    error,
    refetch: fetchBarbers,
    hasBarbers: barbers.length > 0,
  };
};
