import { BarberType } from "@/utils/types";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";


export const useBarbers = () => {
  const [barbers, setBarbers] = useState<BarberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const { data, error } = await supabase
          .from("barbers")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        setBarbers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  return { barbers, loading, error };
};
