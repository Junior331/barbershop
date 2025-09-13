import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { IBarber, IBarberApiResponse, IServiceBarber } from "@/utils/types";
import { logger } from "@/utils/logger";

export const useBarbers = (serviceIds: string[]) => {
  const { apiCall, loading: apiLoading, error: apiError } = useApi();
  const [barbers, setBarbers] = useState<IBarber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchBarbers = useCallback(async () => {
    if (!serviceIds.length) {
      setBarbers([]);
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiCall("/users/barbers/by-services", "POST", {
        serviceIds,
      });

      const parsedBarbers: IBarber[] = data.map((item:IBarberApiResponse) => ({
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

      setBarbers(parsedBarbers);
    } catch (err) {
      logger.error("Erro ao buscar barbeiros:", err);
      setBarbers([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, serviceIds]);

  useEffect(() => {
    fetchBarbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    barbers,
    loading: apiLoading || isLoading,
    error: apiError,
    refetch: fetchBarbers,
  };
};
