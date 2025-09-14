import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

import { appointmentsService } from "@/services";
import type { Appointment } from "@/services";
import { useAuth } from "@/context/AuthContext";

interface AppointmentsByStatus {
  pending: Appointment[];
  confirmed: Appointment[];
  completed: Appointment[];
  today: Appointment[];
}

export const BarberDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentsByStatus>({
    pending: [],
    confirmed: [],
    completed: [],
    today: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingCount: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [pendingData, confirmedData, completedData, todayData] = await Promise.all([
        appointmentsService.getBarberAppointments('PENDING', 1, 10),
        appointmentsService.getBarberAppointments('CONFIRMED', 1, 10),
        appointmentsService.getBarberAppointments('COMPLETED', 1, 5),
        appointmentsService.getBarberTodayAppointments()
      ]);

      setAppointments({
        pending: pendingData.data,
        confirmed: confirmedData.data,
        completed: completedData.data,
        today: todayData
      });

      // Calcular estatísticas
      const todayCount = todayData.length;
      const pendingCount = pendingData.data.length;
      const totalEarnings = completedData.data.reduce((total, apt) => total + apt.totalPrice, 0);
      const averageRating = 4.7; // Implementar cálculo real depois

      setStats({
        todayCount,
        pendingCount,
        totalEarnings,
        averageRating
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.confirmByBarber(appointmentId);
      toast.success('Agendamento confirmado!');
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error('Erro ao confirmar agendamento');
    }
  };

  const handleRejectAppointment = async (appointmentId: string, reason?: string) => {
    try {
      await appointmentsService.rejectByBarber(appointmentId, reason || 'Rejeitado pelo barbeiro');
      toast.success('Agendamento rejeitado');
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao rejeitar agendamento:', error);
      toast.error('Erro ao rejeitar agendamento');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.completeByBarber(appointmentId);
      toast.success('Atendimento concluído!');
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao concluir atendimento:', error);
      toast.error('Erro ao concluir atendimento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={`Olá, ${user?.name?.split(' ')[0]}`} backPath="/" />

        <div className="flex flex-col w-full justify-start items-start gap-4 px-4 pb-6 overflow-auto">

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <img
                    src={getIcons("calendar_outlined_green")}
                    alt="Hoje"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <Title className="text-2xl">{stats.todayCount}</Title>
                  <Text className="text-sm text-gray-600">Agendamentos hoje</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <img
                    src={getIcons("clock_outlined_green")}
                    alt="Pendentes"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <Title className="text-2xl">{stats.pendingCount}</Title>
                  <Text className="text-sm text-gray-600">Pendentes</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <img
                    src={getIcons("payment")}
                    alt="Ganhos"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <Title className="text-lg">
                    {formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.totalEarnings)}
                  </Title>
                  <Text className="text-sm text-gray-600">Ganhos recentes</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <img
                    src={getIcons("star_solid_green")}
                    alt="Avaliação"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <Title className="text-2xl">{stats.averageRating.toFixed(1)}</Title>
                  <Text className="text-sm text-gray-600">Avaliação média</Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Agendamentos de hoje */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <Title className="text-lg">Agendamentos de Hoje</Title>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/barber/calendar')}
              >
                Ver Calendário
              </Button>
            </div>

            {appointments.today.length === 0 ? (
              <div className="text-center py-8">
                <img
                  src={getIcons("calendar_outlined_green")}
                  alt="Sem agendamentos"
                  className="w-16 h-16 opacity-50 mx-auto mb-4"
                />
                <Text className="text-gray-500">Nenhum agendamento para hoje</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.today.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <CircleIcon className="!w-12 !h-12">
                        <img
                          src={appointment.client.avatarUrl || getIcons("fallback")}
                          alt={appointment.client.name}
                          className="w-full h-full object-cover"
                        />
                      </CircleIcon>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Title className="text-base">{appointment.client.name}</Title>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(appointment.status)
                          )}>
                            {getStatusText(appointment.status)}
                          </div>
                        </div>

                        <Text className="text-sm font-medium text-[#6C8762]">
                          {appointment.service.name}
                        </Text>

                        <div className="flex items-center gap-4 mt-2">
                          <Text className="text-sm text-gray-600">
                            🕐 {appointment.scheduledTime}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            ⏱️ {appointment.service.durationMinutes}min
                          </Text>
                          <Text className="text-sm font-medium text-[#6C8762]">
                            {formatter({
                              type: "pt-BR",
                              currency: "BRL",
                              style: "currency",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(appointment.totalPrice)}
                          </Text>
                        </div>
                      </div>

                      {appointment.status === 'CONFIRMED' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Agendamentos pendentes */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <Title className="text-lg">Agendamentos Pendentes</Title>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/barber/appointments?filter=pending')}
              >
                Ver Todos
              </Button>
            </div>

            {appointments.pending.length === 0 ? (
              <div className="text-center py-6">
                <Text className="text-gray-500">Nenhum agendamento pendente</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.pending.slice(0, 3).map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <CircleIcon className="!w-10 !h-10">
                        <img
                          src={appointment.client.avatarUrl || getIcons("fallback")}
                          alt={appointment.client.name}
                          className="w-full h-full object-cover"
                        />
                      </CircleIcon>

                      <div className="flex-1">
                        <Title className="text-sm">{appointment.client.name}</Title>
                        <Text className="text-xs text-[#6C8762]">{appointment.service.name}</Text>
                        <Text className="text-xs text-gray-600">
                          {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR')} às {appointment.scheduledTime}
                        </Text>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleRejectAppointment(appointment.id)}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                        >
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="w-full">
            <Title className="text-lg mb-4">Ações Rápidas</Title>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => navigate('/barber/appointments')}
              >
                <img
                  src={getIcons("calendar_outlined_green")}
                  alt="Agendamentos"
                  className="w-6 h-6"
                />
                <Text className="text-sm">Agendamentos</Text>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => navigate('/barber/wallet')}
              >
                <img
                  src={getIcons("payment")}
                  alt="Carteira"
                  className="w-6 h-6"
                />
                <Text className="text-sm">Carteira</Text>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => navigate('/barber/reviews')}
              >
                <img
                  src={getIcons("star_solid_green")}
                  alt="Avaliações"
                  className="w-6 h-6"
                />
                <Text className="text-sm">Avaliações</Text>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => navigate('/barber/profile')}
              >
                <img
                  src={getIcons("settings")}
                  alt="Perfil"
                  className="w-6 h-6"
                />
                <Text className="text-sm">Perfil</Text>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};