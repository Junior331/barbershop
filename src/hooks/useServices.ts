import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { IService } from "@/utils/types";

export const useServices = () => {
  const { apiCall, loading, error } = useApi();
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchServices = useCallback(async () => {
    try {
      const data = await apiCall("/services", "GET");
      setServices(data);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    error,
    loading,
    services,
    isLoading,
    setIsLoading,
  };
};
