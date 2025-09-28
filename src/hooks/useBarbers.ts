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
  const [barbers, setBarbers] = useState<BarberWithServices[]>([]);
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
      const response = await barbersService.getByServices(serviceIds, 1, 50);
      const barbeiros = response.data || [];
      setBarbers(barbeiros);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar barbeiros';
      logger.error("Erro ao buscar barbeiros:", err);
      setError(errorMessage);
      toast.error('Erro ao carregar barbeiros');
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
