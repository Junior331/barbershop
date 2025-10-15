import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { Card } from "@/components/organisms";
import { Text, Title, Button, Loading } from "@/components/elements";
import { appointmentsService, paymentsService } from "@/services";

interface AppointmentDetails {
  id: string;
  scheduledTo: string;
  scheduledTime: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  barber: {
    name: string;
    avatarUrl?: string;
  };
  service: {
    name: string;
  };
}

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      // appointmentId agora é o ID real do appointment criado ANTES do pagamento
      if (!appointmentId) {
        toast.error('ID do agendamento não encontrado');
        navigate('/');
        return;
      }

      try {
        setLoading(true);

        // Buscar appointment pelo ID (já foi criado com status PENDING)
        console.log('Buscando appointment confirmado pelo webhook:', appointmentId);
        const appointmentData = await appointmentsService.getById(appointmentId);

        setAppointment(appointmentData);

        // Buscar detalhes do pagamento pelo appointmentId
        try {
          const payment = await paymentsService.getByAppointmentId(appointmentId);
          setPaymentDetails(payment);
        } catch (error) {
          console.warn('Payment details not found:', error);
        }

        // Limpar localStorage (não é mais usado)
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('bookingData');
        localStorage.removeItem('finalBookingData');
        localStorage.removeItem('pendingBookingData');
        localStorage.removeItem('pendingPaymentId');

        toast.success('Pagamento confirmado! Seu agendamento foi atualizado.');

      } catch (error: any) {
        console.error('Error fetching appointment:', error);
        toast.error(error.response?.data?.message || 'Erro ao buscar agendamento');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <Text className="text-lg mb-4">Agendamento não encontrado</Text>
          <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center h-screen justify-start min-h-screen p-4 pb-24 overflow-y-auto">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 mt-8">
          <img
            src={getIcons("calendar_tick")}
            alt="Success"
            className="w-16 h-16"
          />
        </div>

        {/* Success Message */}
        <Title className="text-2xl text-center mb-2 text-green-600">
          Pagamento Confirmado!
        </Title>
        <Text className="text-center text-gray-600 mb-8">
          Seu agendamento foi confirmado com sucesso
        </Text>

        {/* Appointment Details Card */}
        <Card className="w-full max-w-md mb-4">
          <div className="p-6">
            <Title className="text-lg mb-4">Detalhes do Agendamento</Title>

            {/* Date and Time */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg">
              <img
                src={getIcons("calendar_solid_green")}
                alt="Calendar"
                className="w-6 h-6"
              />
              <div>
                <Text className="font-medium">
                  {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR', {
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

            {/* Barber */}
            <div className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Barbeiro:</Text>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={appointment.barber.avatarUrl || getIcons("fallback")}
                    alt={appointment.barber.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Text className="font-medium">{appointment.barber.name}</Text>
              </div>
            </div>

            {/* Service */}
            <div className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Serviço:</Text>
              <Text className="font-medium">{appointment.service.name}</Text>
            </div>

            {/* Payment Status */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={getIcons("calendar_tick")}
                  alt="Paid"
                  className="w-5 h-5"
                />
                <Text className="font-medium text-green-700">
                  Pagamento Confirmado
                </Text>
              </div>
              {paymentDetails && (
                <Text className="text-sm text-gray-600 mt-1">
                  ID do Pagamento: {paymentDetails.id}
                </Text>
              )}
            </div>

            {/* Total Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Text className="font-medium">Total Pago:</Text>
                <Title className="text-xl text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(appointment.totalPrice)}
                </Title>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="w-full max-w-md mb-4">
          <div className="p-4">
            <div className="flex items-start gap-2">
              <img
                src={getIcons("notification")}
                alt="Info"
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <Text className="font-medium text-gray-800 mb-1">
                  Próximos Passos:
                </Text>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Você receberá uma confirmação por e-mail</li>
                  <li>• Chegue 5 minutos antes do horário</li>
                  <li>• Caso precise cancelar, faça com antecedência</li>
                  <li>• Em caso de dúvidas, entre em contato</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex w-full max-w-md gap-4 flex-col">
          <Button
            type="button"
            className="w-full h-12"
            onClick={() => navigate('/my-bookings')}
          >
            Ver Meus Agendamentos
          </Button>

          <Button
            type="button"
            className="w-full h-12 bg-white text-[#6C8762] border-2 border-[#6C8762] hover:bg-green-50"
            onClick={() => navigate('/')}
          >
            Voltar para o Início
          </Button>
        </div>
      </div>
    </Layout>
  );
};
