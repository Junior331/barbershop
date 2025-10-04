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
  paymentMethod?: string;
}

export const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  // Poll payment status every 5 seconds
  useEffect(() => {
    if (!appointmentId) return;

    const checkPaymentStatus = async () => {
      try {
        const payment = await paymentsService.getByAppointmentId(appointmentId);

        if (payment.status === 'COMPLETED' || payment.status === 'PAID') {
          toast.success('Pagamento confirmado!');
          navigate(`/payment/success?appointmentId=${appointmentId}`);
        } else if (payment.status === 'FAILED') {
          toast.error('Pagamento falhou');
          navigate(`/payment/error?appointmentId=${appointmentId}`);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then check every 5 seconds
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [appointmentId, navigate]);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        toast.error('ID do agendamento não encontrado');
        navigate('/');
        return;
      }

      try {
        setLoading(true);

        // Fetch appointment details
        const appointmentData = await appointmentsService.getById(appointmentId);
        setAppointment(appointmentData);

        // Fetch payment details
        try {
          const payment = await paymentsService.getByAppointmentId(appointmentId);
          setPaymentDetails(payment);
        } catch (error) {
          console.warn('Payment details not available yet');
        }

      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Erro ao carregar detalhes do agendamento');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, navigate]);

  const handleCheckStatus = async () => {
    if (!appointmentId) return;

    setChecking(true);

    try {
      const payment = await paymentsService.checkStatus(appointmentId);

      if (payment.status === 'COMPLETED') {
        toast.success('Pagamento confirmado!');
        navigate(`/payment/success?appointmentId=${appointmentId}`);
      } else if (payment.status === 'FAILED') {
        toast.error('Pagamento não aprovado');
        navigate(`/payment/error?appointmentId=${appointmentId}`);
      } else {
        toast('Pagamento ainda pendente. Continue tentando...', { icon: '⏳' });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Erro ao verificar status');
    } finally {
      setChecking(false);
    }
  };

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
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pb-24">
        {/* Pending Icon */}
        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-6 mt-8">
          <img
            src={getIcons("clock_outlined")}
            alt="Pending"
            className="w-16 h-16 animate-pulse"
          />
        </div>

        {/* Pending Message */}
        <Title className="text-2xl text-center mb-2 text-yellow-600">
          Pagamento Pendente
        </Title>
        <Text className="text-center text-gray-600 mb-8 max-w-md">
          {appointment.paymentMethod === 'PIX'
            ? 'Aguardando confirmação do pagamento PIX'
            : 'Seu pagamento está sendo processado'}
        </Text>

        {/* Payment Status Card */}
        <Card className="w-full max-w-md mb-4">
          <div className="p-6">
            <Title className="text-lg mb-4">Status do Pagamento</Title>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="loading loading-spinner loading-sm text-yellow-600"></div>
                <Text className="font-medium text-yellow-800">
                  Aguardando Confirmação
                </Text>
              </div>
              <Text className="text-sm text-yellow-700">
                {appointment.paymentMethod === 'PIX'
                  ? 'Assim que o pagamento for confirmado, você receberá uma notificação.'
                  : 'Estamos processando seu pagamento. Isso pode levar alguns minutos.'}
              </Text>
            </div>

            {/* QR Code Section (for PIX) */}
            {appointment.paymentMethod === 'PIX' && paymentDetails?.qrCodeBase64 && (
              <div className="mb-4 text-center">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  QR Code PIX:
                </Text>
                <div className="flex justify-center mb-2">
                  <img
                    src={`data:image/png;base64,${paymentDetails.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <Text className="text-xs text-gray-600">
                  Escaneie este QR Code com o app do seu banco
                </Text>
              </div>
            )}

            {/* PIX Code (copy-paste) */}
            {appointment.paymentMethod === 'PIX' && paymentDetails?.qrCodeData && (
              <div className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Ou copie o código PIX:
                </Text>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentDetails.qrCodeData}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border rounded-lg bg-gray-50 font-mono"
                  />
                  <Button
                    type="button"
                    className="px-4"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentDetails.qrCodeData);
                      toast.success('Código copiado!');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            <div className="border-t pt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Detalhes do Agendamento:
              </Text>
              <div className="space-y-2">
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
                  <Text className="text-sm font-medium text-[#6C8762]">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(appointment.totalPrice)}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions Card */}
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
                  O que fazer agora?
                </Text>
                <ul className="text-sm text-gray-600 space-y-1">
                  {appointment.paymentMethod === 'PIX' ? (
                    <>
                      <li>• Abra o app do seu banco</li>
                      <li>• Escolha pagar com PIX</li>
                      <li>• Escaneie o QR Code ou cole o código</li>
                      <li>• Confirme o pagamento</li>
                      <li>• Aguarde a confirmação (até 2 minutos)</li>
                    </>
                  ) : (
                    <>
                      <li>• Aguarde a confirmação do pagamento</li>
                      <li>• Isso pode levar alguns minutos</li>
                      <li>• Você receberá uma notificação</li>
                      <li>• Não feche esta página</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          <Button
            type="button"
            className="w-full h-12"
            onClick={handleCheckStatus}
            disabled={checking}
          >
            {checking ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Verificando...
              </div>
            ) : (
              'Verificar Status do Pagamento'
            )}
          </Button>

          <Button
            type="button"
            className="w-full h-12 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            onClick={() => navigate('/my-bookings')}
          >
            Ver Meus Agendamentos
          </Button>

          <Button
            type="button"
            className="w-full h-12 bg-white text-red-600 border-2 border-red-300 hover:bg-red-50"
            onClick={() => navigate('/')}
          >
            Sair (o pagamento continuará sendo processado)
          </Button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <div className="loading loading-spinner loading-xs"></div>
          <Text className="text-xs">Verificando automaticamente a cada 5 segundos...</Text>
        </div>
      </div>
    </Layout>
  );
};
