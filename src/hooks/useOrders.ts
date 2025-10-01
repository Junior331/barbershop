import { supabase } from "@/lib/supabase";
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { IBarber, IOrder } from "@/utils/types";

export const useOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os agendamentos usando a função RPC no Supabase
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("fetch_user_orders", { user_id: user.id });

      if (error) throw error;

      const formattedOrders = data?.map((order: IOrder) => ({
        ...order,
        barber: {
          id: order.barber_id,
          name: order.barber_name,
        } as IBarber,
        date: order.date,
      })) || [];

      setOrders(formattedOrders);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar agendamentos.";
      setError(errorMessage);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Função para cancelar um agendamento
  const cancelOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("cancel_order", { order_id: orderId });
      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar o agendamento.";
      setError(errorMessage);
      console.error("Error canceling order:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para deletar um agendamento
  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_order", { order_id: orderId });
      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar o agendamento.";
      setError(errorMessage);
      console.error("Error deleting order:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    cancelOrder,
    deleteOrder,
  };
};
