// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
} from "@/components/elements";

import { paymentsService } from "@/services";

interface PixPaymentState {
  paymentId: string;
  appointmentId: string;
  amount: number;
  qrCode: string;
  qrCodeBase64: string;
  services: string;
}

export const PixPaymentPage = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const location = useLocation();
  const state = location.state as PixPaymentState;

  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [checkingPayment, setCheckingPayment] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no state data
  useEffect(() => {
    if (!state || !state.qrCode || !state.qrCodeBase64) {
      toast.error('Dados de pagamento não encontrados');
      navigate('/schedule');
    }
  }, [state, navigate]);

  // Start polling for payment status
  useEffect(() => {
    if (!state?.paymentId) return;

    const checkPaymentStatus = async () => {
      try {
        setCheckingPayment(true);
        const statusResponse = await paymentsService.checkStatus(state.paymentId);

        console.log('🔍 Payment status checked:', statusResponse.status);

        if (statusResponse.status === 'COMPLETED') {
          setPaymentStatus('COMPLETED');
          stopPolling();

          toast.success('Pagamento confirmado! Redirecionando...', {
            duration: 3000,
            icon: '✅',
          });

          setTimeout(() => {
            navigate(`/booking-confirmation/${appointmentId}`);
          }, 2000);
        } else if (statusResponse.status === 'FAILED') {
          setPaymentStatus('FAILED');
          stopPolling();
          toast.error('Pagamento falhou. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setCheckingPayment(false);
      }
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(checkPaymentStatus, 5000);

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 5000);

    return () => {
      clearTimeout(initialTimeout);
      stopPolling();
    };
  }, [state?.paymentId, appointmentId, navigate]);

  // Countdown timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopPolling();
          toast.error('Tempo expirado. Por favor, gere um novo código PIX.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleCopyPixCode = async () => {
    if (!state?.qrCode) return;

    try {
      await navigator.clipboard.writeText(state.qrCode);
      setCopied(true);
      toast.success('Código PIX copiado!', {
        icon: '📋',
        duration: 2000,
      });

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar código');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualCheck = async () => {
    if (!state?.paymentId) return;

    setCheckingPayment(true);
    try {
      // Force sync with gateway
      const statusResponse = await paymentsService.syncStatusFromGateway(state.paymentId);

      console.log('🔄 Manual sync result:', statusResponse);

      if (statusResponse.status === 'COMPLETED') {
        setPaymentStatus('COMPLETED');
        stopPolling();

        toast.success('Pagamento confirmado!', {
          icon: '✅',
          duration: 3000,
        });

        setTimeout(() => {
          navigate(`/booking-confirmation/${appointmentId}`);
        }, 2000);
      } else {
        toast.info('Pagamento ainda não detectado. Aguarde alguns instantes.', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast.error('Erro ao verificar pagamento');
    } finally {
      setCheckingPayment(false);
    }
  };

  if (!state) return <Loading />;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Pagamento PIX" backPath="/schedule" />

        <div className="flex flex-col w-full justify-start items-center gap-6 px-4 pb-8 overflow-auto h-[calc(100vh-80px)]">

          {/* Payment Status Banner */}
          {paymentStatus === 'COMPLETED' && (
            <div className="w-full max-w-md bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <Text className="font-bold text-green-800">Pagamento Confirmado!</Text>
                  <Text className="text-sm text-green-700">Redirecionando...</Text>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'FAILED' && (
            <div className="w-full max-w-md bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">❌</div>
                <div>
                  <Text className="font-bold text-red-800">Pagamento Falhou</Text>
                  <Text className="text-sm text-red-700">Por favor, tente novamente</Text>
                </div>
              </div>
            </div>
          )}

          {/* Timer */}
          {paymentStatus === 'PENDING' && (
            <Card className="w-full max-w-md mt-4">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={getIcons("timer")} alt="Timer" className="w-5 h-5" />
                  <Text className="text-sm text-gray-600">Tempo restante:</Text>
                </div>
                <Text className={cn(
                  "font-mono text-lg font-bold",
                  timeRemaining < 60 ? "text-red-600" : "text-[#6C8762]"
                )}>
                  {formatTime(timeRemaining)}
                </Text>
              </div>
            </Card>
          )}

          {/* QR Code Card */}
          <Card className="w-full max-w-md">
            <div className="p-6 flex flex-col items-center gap-4">
              <Title className="text-xl text-center">Escaneie o QR Code</Title>

              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={state.qrCodeBase64}
                  alt="QR Code PIX"
                  className="w-64 h-64 object-contain"
                />
              </div>

              {/* Amount */}
              <div className="text-center">
                <Text className="text-sm text-gray-600 mb-1">Valor a pagar:</Text>
                <Title className="text-2xl text-[#6C8762]">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(state.amount)}
                </Title>
              </div>

              {/* Services */}
              <div className="w-full bg-gray-50 rounded-lg p-3">
                <Text className="text-xs text-gray-600 mb-1">Serviços:</Text>
                <Text className="text-sm font-medium">{state.services}</Text>
              </div>
            </div>
          </Card>

          {/* Copy PIX Code Card */}
          <Card className="w-full max-w-md">
            <div className="p-4">
              <Text className="font-medium mb-3 text-center">Ou copie o código PIX:</Text>

              {/* PIX Code Display */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3 break-all">
                <Text className="text-xs font-mono text-gray-700">
                  {state.qrCode}
                </Text>
              </div>

              {/* Copy Button */}
              <Button
                type="button"
                className={cn(
                  "w-full h-12",
                  copied ? "bg-green-600 hover:bg-green-700" : ""
                )}
                onClick={handleCopyPixCode}
              >
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={getIcons(copied ? "check" : "copy")}
                    alt={copied ? "Copiado" : "Copiar"}
                    className="w-5 h-5"
                  />
                  <span>{copied ? "Código Copiado!" : "Copiar Código PIX"}</span>
                </div>
              </Button>
            </div>
          </Card>

          {/* Instructions Card */}
          <Card className="w-full max-w-md">
            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <img src={getIcons("info")} alt="Info" className="w-5 h-5 mt-0.5" />
                <Title className="text-base">Como pagar:</Title>
              </div>

              <ol className="space-y-2 ml-2">
                <li className="flex gap-2">
                  <Text className="font-bold text-[#6C8762]">1.</Text>
                  <Text className="text-sm">Abra o app do seu banco</Text>
                </li>
                <li className="flex gap-2">
                  <Text className="font-bold text-[#6C8762]">2.</Text>
                  <Text className="text-sm">Escolha pagar com PIX</Text>
                </li>
                <li className="flex gap-2">
                  <Text className="font-bold text-[#6C8762]">3.</Text>
                  <Text className="text-sm">Escaneie o QR Code ou cole o código</Text>
                </li>
                <li className="flex gap-2">
                  <Text className="font-bold text-[#6C8762]">4.</Text>
                  <Text className="text-sm">Confirme o pagamento</Text>
                </li>
              </ol>
            </div>
          </Card>

          {/* Status Check Section */}
          {paymentStatus === 'PENDING' && (
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center gap-2 mb-3">
                {checkingPayment && (
                  <>
                    <div className="loading loading-spinner loading-sm text-[#6C8762]"></div>
                    <Text className="text-sm text-gray-600">
                      Verificando pagamento...
                    </Text>
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={handleManualCheck}
                disabled={checkingPayment}
              >
                <div className="flex items-center justify-center gap-2">
                  <img src={getIcons("refresh")} alt="Verificar" className="w-5 h-5" />
                  <span>Já paguei - Verificar Status</span>
                </div>
              </Button>
            </div>
          )}

          {/* Help Section */}
          <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-xl">💡</div>
              <div>
                <Text className="font-medium text-yellow-800 mb-1">
                  Precisa de ajuda?
                </Text>
                <Text className="text-sm text-yellow-700">
                  Após o pagamento, a confirmação é automática e leva apenas alguns segundos.
                  Se demorar mais de 2 minutos, clique em "Verificar Status".
                </Text>
              </div>
            </div>
          </div>

          {/* Spacer for bottom padding */}
          <div className="h-8" />
        </div>
      </div>
    </Layout>
  );
};
