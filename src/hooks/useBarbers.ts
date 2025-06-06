import { useEffect, useState, useCallback } from "react";

import { supabase } from "@/lib/supabase";
import { IBarber, UseBarbersResult, BarberResponse } from "@/utils/types";

export function useBarbers(serviceIds: string[]): UseBarbersResult {
  const [state, setState] = useState<{
    loading: boolean;
    barbers: IBarber[];
    error: string | null;
  }>({
    barbers: [],
    error: null,
    loading: false,
  });

  const parseBarberResponse = useCallback((data: BarberResponse[]): IBarber[] => {
    return data.map((item) => ({
      role: 'barber',
      id: item.barber_id,
      name: item.barber_name,
      email: item.barber_email,
      phone: item.barber_phone,
      avatar_url: item.barber_avatar_url,
      barber_details: {
        is_active: true,
        // cuts_completed: 0,
        id: item.barber_id,
        barber_rating: item.barber_rating,
        description: item.barber_description,
      },
      services: item.services_info.map(service => service.name),
      services_full: item.services_info,
      total_price: item.total_price,
    }));
  }, []);

  const fetchBarbers = useCallback(async () => {
    if (!serviceIds.length) {
      setState({ barbers: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .rpc('get_barbers_by_services', { service_ids: serviceIds })
        .select('*');

        console.log(`data ::`, data)

      if (error) throw error;

      const barbersData = data as BarberResponse[] | null;
      
      if (!barbersData) {
        setState({ barbers: [], loading: false, error: null });
        return;
      }

      setState({
        barbers: parseBarberResponse(barbersData),
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
      setState({
        barbers: [],
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load barbers",
      });
    }
  }, [serviceIds, parseBarberResponse]);

  useEffect(() => {
    fetchBarbers();
  }, []);

  return {
    barbers: state.barbers,
    loading: state.loading,
    error: state.error,
    refetch: fetchBarbers,
  };
}