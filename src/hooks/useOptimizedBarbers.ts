import { useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { IBarber, IBarberApiResponse, IServiceBarber } from "@/utils/types";
import { logger } from "@/utils/logger";

// Cache para otimizar requisições
const barbersCache = new Map<string, { data: IBarber[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useOptimizedBarbers = (serviceIds: string[]) => {
  const { apiCall, loading: apiLoading, error: apiError } = useApi();
  const [barbers, setBarbers] = useState<IBarber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gerar chave de cache baseada nos serviceIds
  const cacheKey = useMemo(() => 
    serviceIds.sort().join(','), [serviceIds]
  );

  // Verificar cache
  const getCachedData = useCallback((key: string): IBarber[] | null => {
    const cached = barbersCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Salvar no cache
  const setCachedData = useCallback((key: string, data: IBarber[]) => {
    barbersCache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Transformar dados da API de forma otimizada
  const transformBarbersData = useCallback((data: IBarberApiResponse[]): IBarber[] => {
    return data.map((item) => ({
      role: item.role.toLowerCase() as "barber",
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      avatar_url: item.avatarUrl,
      barber_details: {
        id: item.id,
        description: item.biography,
        is_active: item.isVerified,
        barber_rating: item.barberRating ?? 0,
      },
      services: item.serviceBarbers.map((s: IServiceBarber) => s.name),
      services_full: item.serviceBarbers.map((s: IServiceBarber) => ({
        ...s,
        image_url: s.imageUrl,
        durationMinutes: s.durationMinutes
      })),
      total_price: item.serviceBarbers.reduce((sum, s) => sum + s.price, 0),
    }));
  }, []);

  const fetchBarbers = useCallback(async () => {
    if (!serviceIds.length) {
      setBarbers([]);
      return;
    }

    // Verificar cache primeiro
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setBarbers(cachedData);
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiCall("/users/barbers/by-services", "POST", {
        serviceIds,
      });

      const parsedBarbers = transformBarbersData(data);
      
      // Salvar no cache
      setCachedData(cacheKey, parsedBarbers);
      setBarbers(parsedBarbers);
    } catch (err) {
      logger.error("Erro ao buscar barbeiros:", err);
      setBarbers([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, serviceIds, cacheKey, getCachedData, setCachedData, transformBarbersData]);

  // Debounce para evitar requisições muito frequentes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBarbers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchBarbers]);

  // Limpar cache quando necessário
  const clearCache = useCallback(() => {
    barbersCache.clear();
  }, []);

  return {
    barbers,
    loading: apiLoading || isLoading,
    error: apiError,
    refetch: fetchBarbers,
    clearCache,
  };
};