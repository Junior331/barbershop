import { Order } from "@/utils/types";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export const useBarberSchedules = (barberId: string) => {
  const [schedules, setSchedules] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      let query = supabase
        .from("schedules")
        .select("*")
        .eq("barber_id", barberId);

      if (startDate && endDate) {
        query = query
          .gte("date_time", startDate.toISOString())
          .lte("date_time", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules(data || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barberId) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  return { schedules, loading, error, fetchSchedules };
};
