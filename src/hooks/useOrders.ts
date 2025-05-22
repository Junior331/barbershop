import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarberType, Order, Service } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";

export const useOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Buscar todos os agendamentos do usuário
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          barber:barber_id (*),
          service:service_id (*)
        `)
        .eq('client_id', user.id)
        .order('date_time', { ascending: true });

      if (error) throw error;

      const formattedOrders = data?.map(order => ({
        ...order,
        barber: order.barber as BarberType,
        services: order.service ? [order.service as Service] : [],
        date: order.date_time,
      })) || [];

      setOrders(formattedOrders);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao buscar agendamentos, tente novamente.";
      setError(errorMessage);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Buscar um agendamento específico
  const fetchOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          barber:barber_id (*),
          service:service_id (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          barber: data.barber as BarberType,
          services: data.service ? [data.service as Service] : [],
          date: data.date_time,
        };
      }
      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao buscar agendamento, tente novamente.";
      setError(errorMessage);
      console.error("Error fetching order:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar um agendamento
  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, ...data[0] } : order
        ));
        return data[0];
      }
      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar agendamento, tente novamente.";
      setError(errorMessage);
      console.error("Error updating order:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar um agendamento
  const cancelOrder = useCallback(async (orderId: string) => {
    return updateOrder(orderId, { status: 'canceled' });
  }, [updateOrder]);

  // Deletar um agendamento
  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== orderId));
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao deletar agendamento, tente novamente.";
      setError(errorMessage);
      console.error("Error deleting order:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    updateOrder,
    cancelOrder,
    deleteOrder,
  };
};