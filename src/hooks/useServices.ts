import { useState, useEffect, useCallback } from "react";

import { Service } from "@/utils/types";
import { supabase } from "@/lib/supabase";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (supabaseError) throw supabaseError;
      setServices(data.filter((item) => item.public) || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar serviços"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Função para buscar um serviço específico por ID
  const getServiceById = useCallback(async (id: string) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (supabaseError) throw supabaseError;
      return data;
    } catch (err) {
      console.error("Erro ao buscar serviço:", err);
      return null;
    }
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    getServiceById,
  };
};
