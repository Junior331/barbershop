import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { IBarber, IOrder } from "@/utils/types";
import { appointmentsService, Appointment } from "@/services";
import toast from "react-hot-toast";

export const useOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mapear formato do backend para o formato IOrder
  const mapAppointmentToOrder = (appointment: Appointment): IOrder => {
    return {
      id: appointment.id,
      barber_id: appointment.barberId,
      barber_name: appointment.barber.name,
      barber: {
        id: appointment.barber.id,
        name: appointment.barber.name,
      },
      date: new Date(appointment.scheduledTo),
      start_time: appointment.scheduledTo,
      end_time: appointment.scheduledTo,
      status: appointment.status.toLowerCase() as any,
      services: [{
        service_id: appointment.service.id,
        service_name: appointment.service.name,
        service_icon: appointment.service.imageUrl || '',
        service_price: appointment.service.price,
        service_duration: appointment.service.durationMinutes,
      }],
      final_amount: appointment.totalPrice,
      discount_amount: appointment.discountAmount || 0,
      service_name: appointment.service.name,
      promotion_id: '',
      client_id: appointment.clientId,
      created_at: appointment.createdAt,
      updated_at: appointment.createdAt,
      notes: null,
      isCompleted: appointment.status === 'COMPLETED',
    } as IOrder;
  };

  // Função para buscar os agendamentos usando o backend
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Buscar agendamentos ativos e histórico
      const [activeAppointments, historyResponse] = await Promise.all([
        appointmentsService.getMyActiveAppointments(),
        appointmentsService.getMyHistory(1, 100),
      ]);

      // Combinar ambos e mapear para o formato IOrder
      const allAppointments = [
        ...activeAppointments,
        ...(historyResponse.data || []),
      ];

      // Remover duplicatas por ID
      const uniqueAppointments = allAppointments.filter(
        (appointment, index, self) =>
          index === self.findIndex((a) => a.id === appointment.id)
      );

      const formattedOrders = uniqueAppointments.map(mapAppointmentToOrder);

      setOrders(formattedOrders);
      setError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar agendamentos.";
      setError(errorMessage);
      console.error("Error fetching orders:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Função para cancelar um agendamento
  const cancelOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const response = await appointmentsService.cancelByClient(orderId);

      // Remover da lista ou atualizar status
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'canceled' as any }
          : order
      ));

      if (response.canCancelFree) {
        toast.success('Agendamento cancelado sem custo!');
      } else {
        toast.success(`Agendamento cancelado. Taxa: R$ ${response.cancellationFee.toFixed(2)}`);
      }

      setError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar o agendamento.";
      setError(errorMessage);
      console.error("Error canceling order:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para deletar um agendamento (apenas para CANCELLED/EXPIRED)
  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      // Cancelar o agendamento no backend
      await appointmentsService.cancel(orderId);

      // Remover da lista local
      setOrders(prev => prev.filter(order => order.id !== orderId));

      toast.success('Agendamento removido com sucesso!');
      setError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar o agendamento.";
      setError(errorMessage);
      console.error("Error deleting order:", error);
      toast.error(errorMessage);
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
