import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BarberAppointments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  useEffect(() => {
    const filterParam = searchParams.get('filter') as FilterStatus;
    if (filterParam && ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAppointments(1);
  }, [filter]);

  const loadAppointments = async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = filter === 'ALL'
        ? await appointmentsService.getBarberAllAppointments(pageNum, 20)
        : await appointmentsService.getBarberAppointments(filter, pageNum, 20);

      if (append) {
        setAppointments(prev => [...prev, ...response.data]);
      } else {
        setAppointments(response.data);
      }

      setHasMore(response.meta.page < response.meta.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadAppointments(page + 1, true);
    }
  };

  const handleFilterChange = (newFilter: FilterStatus) => {
    setFilter(newFilter);
    setPage(1);
    setHasMore(true);

    // Atualizar URL
    if (newFilter === 'ALL') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', newFilter.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.confirmByBarber(appointmentId);
      toast.success('Agendamento confirmado!');

      // Atualizar a lista
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'CONFIRMED' as any }
            : apt
        )
      );
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error('Erro ao confirmar agendamento');
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    const reason = window.prompt('Motivo da rejeição (opcional):');

    try {
      await appointmentsService.rejectByBarber(appointmentId, reason || 'Rejeitado pelo barbeiro');
      toast.success('Agendamento rejeitado');

      // Remover da lista ou atualizar status
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'CANCELLED' as any }
            : apt
        )
      );
    } catch (error) {
      console.error('Erro ao rejeitar agendamento:', error);
      toast.error('Erro ao rejeitar agendamento');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.completeByBarber(appointmentId);
      toast.success('Atendimento concluído!');

      // Atualizar status
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'COMPLETED' as any }
            : apt
        )
      );
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

  const filterButtons: { key: FilterStatus; label: string; count?: number }[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'PENDING', label: 'Pendentes' },
    { key: 'CONFIRMED', label: 'Confirmados' },
    { key: 'COMPLETED', label: 'Concluídos' },
    { key: 'CANCELLED', label: 'Cancelados' },
  ];

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Agendamentos" backPath="/barber" />

        <div className="flex flex-col w-full justify-start items-start gap-4 px-4 pb-6 overflow-auto">

          {/* Filtros */}
          <div className="w-full">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {filterButtons.map((button) => (
                <button
                  key={button.key}
                  onClick={() => handleFilterChange(button.key)}
                  className={cn(
                    "min-w-fit px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    filter === button.key
                      ? "bg-[#6C8762] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {button.label}
                  {button.count && (
                    <span className="ml-1 text-xs">({button.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de agendamentos */}
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <img
                src={getIcons("calendar_outlined_green")}
                alt="Sem agendamentos"
                className="w-16 h-16 opacity-50 mb-4"
              />
              <Title className="text-gray-500 mb-2">Nenhum agendamento encontrado</Title>
              <Text className="text-gray-400 text-center">
                {filter === 'ALL'
                  ? "Você ainda não tem agendamentos"
                  : `Nenhum agendamento ${getStatusText(filter).toLowerCase()}`
                }
              </Text>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar do cliente */}
                      <CircleIcon className="!w-14 !h-14 flex-shrink-0">
                        <img
                          src={appointment.client.avatarUrl || getIcons("fallback")}
                          alt={appointment.client.name}
                          className="w-full h-full object-cover"
                        />
                      </CircleIcon>

                      {/* Informações principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <Title className="text-base truncate">
                            {appointment.client.name}
                          </Title>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                            getStatusColor(appointment.status)
                          )}>
                            {getStatusText(appointment.status)}
                          </div>
                        </div>

                        {/* Serviço */}
                        <div className="flex items-center gap-2 mb-2">
                          <CircleIcon className="!w-6 !h-6">
                            <img
                              src={appointment.service.imageUrl || getIcons("fallback")}
                              alt={appointment.service.name}
                              className="w-full h-full object-cover"
                            />
                          </CircleIcon>
                          <Text className="font-medium text-[#6C8762] text-sm">
                            {appointment.service.name}
                          </Text>
                        </div>

                        {/* Detalhes */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={getIcons("calendar_outlined_green")}
                              alt="Data"
                              className="w-4 h-4"
                            />
                            <Text className="text-xs">
                              {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short'
                              })}
                            </Text>
                          </div>

                          <div className="flex items-center gap-2">
                            <img
                              src={getIcons("clock_outlined_green")}
                              alt="Horário"
                              className="w-4 h-4"
                            />
                            <Text className="text-xs">
                              {appointment.scheduledTime} • {appointment.service.durationMinutes}min
                            </Text>
                          </div>
                        </div>

                        {/* Valor */}
                        <div className="flex items-center justify-between mb-3">
                          <Text className="text-lg font-medium text-[#6C8762]">
                            {formatter({
                              type: "pt-BR",
                              currency: "BRL",
                              style: "currency",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(appointment.totalPrice)}
                          </Text>

                          {appointment.paymentStatus && (
                            <div className={cn(
                              "px-2 py-1 rounded text-xs",
                              appointment.paymentStatus === 'COMPLETED' ? "bg-green-100 text-green-700" :
                              appointment.paymentStatus === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {appointment.paymentStatus === 'COMPLETED' ? 'Pago' :
                               appointment.paymentStatus === 'PENDING' ? 'Pendente' : 'Falhou'}
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 flex-wrap">
                          {appointment.status === 'PENDING' && (
                            <>
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
                            </>
                          )}

                          {appointment.status === 'CONFIRMED' && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              Concluir Atendimento
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/barber/appointments/${appointment.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Botão carregar mais */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="loading loading-spinner loading-sm"></div>
                        Carregando...
                      </div>
                    ) : (
                      'Carregar mais agendamentos'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};