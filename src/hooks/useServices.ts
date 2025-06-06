import { useState, useEffect, useCallback } from "react";

import { supabase } from "@/lib/supabase";
import { IService } from "@/utils/types";

export const useServices = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<IService[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (supabaseError) throw supabaseError;

      setServices(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Falha ao carregar serviços";
      setError(errorMessage);
      console.error("Erro ao buscar serviços:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getServiceById = useCallback(async (id: string) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("services")
        .select(
          `
          id,
          name,
          description,
          duration_minutes,
          image_url,
          price,
          discount,
          is_active,
          created_at
        `
        )
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
