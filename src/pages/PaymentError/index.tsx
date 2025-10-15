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
}

export const PaymentError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        setErrorMessage('ID do agendamento não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch appointment details
        const appointmentData = await appointmentsService.getById(appointmentId);
        setAppointment(appointmentData);

        // Try to get payment error details
        try {
          const payment = await paymentsService.getByAppointmentId(appointmentId);
          if (payment?.failureReason) {
            setErrorMessage(payment.failureReason);
          }
        } catch (error) {
          console.warn('Could not fetch payment details');
        }

      } catch (error: any) {
        console.error('Error fetching appointment:', error);
        setErrorMessage(error?.response?.data?.message || 'Erro ao processar pagamento');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  const handleRetryPayment = async () => {
    if (!appointment) return;

    setRetrying(true);

    try {
      // ✅ Create PIX payment with Checkout Transparente
      const pixPayment = await paymentsService.createPixPayment({
        appointmentId: appointment.id,
        amount: appointment.totalPrice,
        description: `Reagendamento - Appointment ${appointment.id}`,
        metadata: {
          source: 'payment-error-retry',
        }
      });

      // Navigate to PIX QR Code page
      if (pixPayment.qrCode && pixPayment.qrCodeBase64) {
        navigate(`/payment/pix/${appointment.id}`, {
          state: {
            paymentId: pixPayment.id,
            appointmentId: appointment.id,
            amount: appointment.totalPrice,
            qrCode: pixPayment.qrCode,
            qrCodeBase64: pixPayment.qrCodeBase64,
            services: 'Reagendamento',
          }
        });
      } else {
        toast.error('Erro ao gerar QR Code PIX');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast.error('Erro ao tentar novamente. Tente mais tarde.');
      setRetrying(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-24">
        {/* Error Icon */}
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6 mt-8">
          <img
            src={getIcons("trash_red")}
            alt="Error"
            className="w-16 h-16"
          />
        </div>

        {/* Error Message */}
        <Title className="text-2xl text-center mb-2 text-red-600">
          Pagamento Não Aprovado
        </Title>
        <Text className="text-center text-gray-600 mb-8 max-w-md">
          Infelizmente não conseguimos processar seu pagamento
        </Text>

        {/* Error Details Card */}
        <Card className="w-full max-w-md mb-4">
          <div className="p-6">
            <Title className="text-lg mb-4">O que aconteceu?</Title>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-sm text-red-800">
                {errorMessage ||
                  'O pagamento foi recusado ou cancelado. Isso pode acontecer por diversos motivos, como saldo insuficiente, dados incorretos ou cancelamento manual.'}
              </Text>
            </div>

            {appointment && (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Detalhes do Agendamento:
                </Text>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Data:</Text>
                    <Text className="text-sm font-medium">
                      {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR')}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Horário:</Text>
                    <Text className="text-sm font-medium">{appointment.scheduledTime}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Valor:</Text>
                    <Text className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(appointment.totalPrice)}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Status:</Text>
                    <Text className="text-sm font-medium text-yellow-600">
                      Aguardando Pagamento
                    </Text>
                  </div>
                </div>
              </>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <img
                  src={getIcons("notification")}
                  alt="Info"
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <Text className="text-sm font-medium text-yellow-800 mb-1">
                    Importante:
                  </Text>
                  <Text className="text-sm text-yellow-700">
                    Seu agendamento foi criado, mas está pendente de pagamento.
                    Você pode tentar pagar novamente ou cancelar o agendamento.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Common Reasons Card */}
        <Card className="w-full max-w-md mb-4">
          <div className="p-4">
            <Text className="font-medium text-gray-800 mb-2">
              Motivos Comuns:
            </Text>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Saldo insuficiente ou limite excedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Dados do cartão incorretos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Pagamento cancelado manualmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Problemas de comunicação com o banco</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          {appointment && (
            <Button
              type="button"
              className="w-full h-12"
              onClick={handleRetryPayment}
              disabled={retrying}
            >
              {retrying ? (
                <div className="flex items-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Processando...
                </div>
              ) : (
                'Tentar Pagamento Novamente'
              )}
            </Button>
          )}

          <Button
            type="button"
            className="w-full h-12 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
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
