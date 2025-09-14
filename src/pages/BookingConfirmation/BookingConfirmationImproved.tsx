import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

import { appointmentsService } from "@/services";
import type { Appointment } from "@/services";

export const BookingConfirmationImproved = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) {
        toast.error('ID do agendamento não encontrado');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await appointmentsService.getById(appointmentId);
        setAppointment(data);
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
        toast.error('Erro ao carregar detalhes do agendamento');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [appointmentId, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'CONFIRMED':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Aguardando Confirmação';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'PROCESSING':
        return 'Processando';
      case 'COMPLETED':
        return 'Pago';
      case 'FAILED':
        return 'Falhou';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Cartão de Crédito';
      case 'DEBIT_CARD':
        return 'Cartão de Débito';
      case 'PIX':
        return 'PIX';
      case 'CASH':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  const handleViewMyBookings = () => {
    navigate('/mybookings');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    const confirm = window.confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirm) return;

    try {
      await appointmentsService.cancelByClient(appointment.id, 'Cancelado pelo cliente');
      toast.success('Agendamento cancelado com sucesso');
      setAppointment(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  if (loading) return <Loading />;
  if (!appointment) return <Loading />;

  const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  const appointmentDate = new Date(appointment.scheduledTo);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancelFree = hoursUntilAppointment > 24;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        {/* Header de sucesso */}
        <div className="w-full bg-gradient-to-r from-[#6C8762] to-[#5a7354] text-white py-8 px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <img
                src={getIcons("check")}
                alt="Success"
                className="w-8 h-8"
              />
            </div>
          </motion.div>
          <Title className="text-2xl text-white mb-2">
            {appointment.status === 'PENDING'
              ? 'Agendamento Solicitado!'
              : 'Agendamento Confirmado!'}
          </Title>
          <Text className="text-white text-opacity-90">
            {appointment.status === 'PENDING'
              ? 'Aguardando confirmação do barbeiro'
              : 'Seu horário foi reservado com sucesso'}
          </Text>
        </div>

        <div className="flex flex-col w-full justify-start items-start gap-4 px-4 pb-6 overflow-auto">

          {/* Status do agendamento */}
          <Card className="w-full mt-4">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Text className="text-sm text-gray-600">Status do Agendamento:</Text>
                  <Text className={cn("font-medium text-lg", getStatusColor(appointment.status))}>
                    {getStatusText(appointment.status)}
                  </Text>
                </div>
                <div className="text-right">
                  <Text className="text-sm text-gray-600">Protocolo:</Text>
                  <Text className="font-mono text-sm">#{appointment.id.substring(0, 8)}</Text>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="flex items-center gap-3 p-3 bg-[#6C8762] bg-opacity-10 rounded-lg">
                <img
                  src={getIcons("calendar_outlined_green")}
                  alt="Calendar"
                  className="w-6 h-6"
                />
                <div>
                  <Text className="font-medium">
                    {appointmentDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    às {appointment.scheduledTime}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Detalhes do Serviço */}
          <Card className="w-full">
            <div className="p-4">
              <Title className="mb-4">Detalhes do Serviço</Title>

              {/* Serviço */}
              <div className="flex items-center gap-3 mb-4">
                <CircleIcon className="!w-12 !h-12">
                  <img
                    src={appointment.service.imageUrl || getIcons("fallback")}
                    alt={appointment.service.name}
                    className="w-full h-full object-cover"
                  />
                </CircleIcon>
                <div className="flex-1">
                  <Text className="font-medium">{appointment.service.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {appointment.service.durationMinutes} minutos
                  </Text>
                </div>
                <Text className="font-medium text-[#6C8762]">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(appointment.totalPrice)}
                </Text>
              </div>

              {/* Barbeiro */}
              <div className="flex items-center gap-3 mb-4">
                <CircleIcon className="!w-12 !h-12">
                  <img
                    src={appointment.barber.avatarUrl || getIcons("fallback")}
                    alt={appointment.barber.name}
                    className="w-full h-full object-cover"
                  />
                </CircleIcon>
                <div className="flex-1">
                  <Text className="font-medium">{appointment.barber.name}</Text>
                  <Text className="text-sm text-gray-600">{appointment.barber.role}</Text>
                </div>
              </div>

              {/* Localização */}
              <div className="flex items-center gap-3">
                <img
                  src={getIcons("location_outlined_green")}
                  alt="Location"
                  className="w-6 h-6"
                />
                <div>
                  <Text className="font-medium">{appointment.barberShop.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {appointment.barberShop.address}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Informações de Pagamento */}
          <Card className="w-full">
            <div className="p-4">
              <Title className="mb-3">Pagamento</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text className="text-gray-600">Método:</Text>
                  <Text className="font-medium">
                    {getPaymentMethodText(appointment.paymentMethod || 'CASH')}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600">Status:</Text>
                  <Text className={cn(
                    "font-medium",
                    appointment.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                    appointment.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                  )}>
                    {getPaymentStatusText(appointment.paymentStatus)}
                  </Text>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Text className="font-medium">Total:</Text>
                  <Text className="font-medium text-[#6C8762]">
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
            </div>
          </Card>

          {/* Informações importantes */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <img
                src={getIcons("info")}
                alt="Info"
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <Text className="font-medium text-blue-800 mb-2">
                  Próximos Passos:
                </Text>
                <ul className="text-sm text-blue-700 space-y-1">
                  {appointment.status === 'PENDING' && (
                    <>
                      <li>• O barbeiro foi notificado e irá confirmar em breve</li>
                      <li>• Você receberá uma notificação quando for confirmado</li>
                    </>
                  )}
                  {appointment.status === 'CONFIRMED' && (
                    <>
                      <li>• Chegue 5 minutos antes do horário marcado</li>
                      <li>• Você receberá um lembrete no WhatsApp</li>
                    </>
                  )}
                  <li>• Acompanhe o status na área "Meus Agendamentos"</li>
                  <li>• Em caso de dúvidas, entre em contato conosco</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Política de Cancelamento */}
          {canCancel && (
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <img
                  src={getIcons("warning")}
                  alt="Warning"
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <Text className="font-medium text-yellow-800 mb-1">
                    Política de Cancelamento:
                  </Text>
                  <Text className="text-sm text-yellow-700 mb-2">
                    {canCancelFree
                      ? "Você pode cancelar gratuitamente até 24h antes do agendamento."
                      : "Cancelamento após 24h antes do horário será cobrada taxa de 50%."}
                  </Text>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                    onClick={handleCancelAppointment}
                  >
                    Cancelar Agendamento
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="w-full space-y-3 mt-6">
            <Button
              type="button"
              className="w-full h-12"
              onClick={handleViewMyBookings}
            >
              Ver Meus Agendamentos
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={handleBackToHome}
            >
              Voltar ao Início
            </Button>
          </div>

          {/* Avaliação (se concluído) */}
          {appointment.status === 'COMPLETED' && (
            <Card className="w-full">
              <div className="p-4 text-center">
                <Title className="mb-2">Como foi sua experiência?</Title>
                <Text className="text-gray-600 mb-4">
                  Sua opinião é muito importante para nós
                </Text>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/review/${appointment.id}`)}
                >
                  Avaliar Serviço
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};