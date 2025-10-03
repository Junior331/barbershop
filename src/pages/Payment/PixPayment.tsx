// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import { Text, Title, Button } from "@/components/elements";
import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { paymentsService } from "@/services";
import { Circle, CircleAlertIcon, Copy, CopyPlus } from "lucide-react";

interface PixPaymentData {
  qrCode: string;
  qrCodeBase64: string;
  amount: number;
  paymentId: string;
  appointmentId: string;
}

export const PixPayment = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0); // Usar ref ao invés de estado

  useEffect(() => {
    const data = localStorage.getItem('pixPaymentData');
    if (!data) {
      toast.error('Dados de pagamento não encontrados');
      navigate('/');
      return;
    }

    const paymentData: PixPaymentData = JSON.parse(data);
    setPixData(paymentData);
  }, [navigate]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!pixData?.paymentId) return;

    const checkPaymentStatus = async () => {
      try {
        pollingCountRef.current += 1;
        const currentCount = pollingCountRef.current;

        // A cada 3 tentativas, força sincronização com Mercado Pago
        const shouldForceSync = currentCount % 3 === 0;

        console.log(`📊 Verificando pagamento (tentativa ${currentCount}) - ${shouldForceSync ? '🔄 SYNC com MP' : '💾 Banco de dados'}`);

        let status;
        if (shouldForceSync) {
          console.log('🔄 Forçando sincronização com Mercado Pago (tentativa', currentCount, ')...');
          // Chama endpoint que consulta o Mercado Pago diretamente
          const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/${pixData.paymentId}/sync-status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          status = await response.json();
          console.log('✅ Resposta do sync:', status);
        } else {
          // Consulta normal do banco de dados
          status = await paymentsService.checkStatus(pixData.paymentId);
        }

        setPaymentStatus(status.status);

        if (status.status === 'COMPLETED') {
          // Pagamento aprovado!
          clearInterval(pollingInterval.current!);
          toast.success('Pagamento confirmado! Redirecionando...');

          localStorage.removeItem('pixPaymentData');

          setTimeout(() => {
            navigate(`/booking-confirmation/${appointmentId}`);
          }, 2000);
        } else if (status.status === 'FAILED') {
          // Pagamento falhou
          clearInterval(pollingInterval.current!);
          toast.error('Pagamento não foi aprovado. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        // Não mostrar erro para o usuário, continuar tentando
      }
    };

    // Verificar imediatamente
    checkPaymentStatus();

    // Depois verificar a cada 5 segundos
    pollingInterval.current = setInterval(checkPaymentStatus, 5000);

    // Parar após 10 minutos (120 tentativas)
    const timeout = setTimeout(() => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        toast('Tempo de espera excedido. Você pode verificar o status na página de agendamentos.', {
          icon: '⏱️',
          duration: 5000,
        });
      }
    }, 10 * 60 * 1000);

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      clearTimeout(timeout);
    };
  }, [pixData, appointmentId, navigate]);

  const handleCopyCode = () => {
    if (!pixData) return;

    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    toast.success('Código PIX copiado!');

    setTimeout(() => setCopied(false), 3000);
  };

  const handleFinish = () => {
    localStorage.removeItem('pixPaymentData');
    navigate(`/booking-confirmation/${appointmentId}`);
  };

  if (!pixData) return null;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Pagamento PIX" backPath="/" />

        <div className="flex flex-col w-full justify-between items-start gap-6 px-4 pb-4 overflow-auto h-[calc(100vh-0px)]">

          {/* Status */}
          {paymentStatus === 'COMPLETED' ? (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <img src={getIcons("check")} alt="Success" className="w-8 h-8" />
                <div>
                  <Text className="font-medium text-green-800">
                    Pagamento confirmado! ✅
                  </Text>
                  <Text className="text-sm text-green-700">
                    Seu agendamento foi confirmado com sucesso
                  </Text>
                </div>
              </div>
            </div>
          ) : paymentStatus === 'FAILED' ? (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <img src={getIcons("error")} alt="Error" className="w-8 h-8" />
                <div>
                  <Text className="font-medium text-red-800">
                    Pagamento não aprovado ❌
                  </Text>
                  <Text className="text-sm text-red-700">
                    Tente novamente ou escolha outro método de pagamento
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="loading loading-spinner loading-md text-yellow-600"></div>
                <div>
                  <Text className="font-medium text-yellow-800">
                    Aguardando pagamento...
                  </Text>
                  <Text className="text-sm text-yellow-700">
                    Escaneie o QR Code ou copie o código abaixo
                    {pollingCount > 0 && ` (verificando ${pollingCount}x)`}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* QR Code */}
          <Card className="w-full">
            <div className="flex flex-col items-center">
              <Title className="mb-4 text-center">QR Code PIX</Title>

              {pixData.qrCodeBase64 && (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <img
                    src={pixData.qrCodeBase64}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                </div>
              )}

              <div className="flex items- justify-center w-full bg-[#6C8762] bg-opacity-10 rounded-lg p-2 mb-2">
                <Text className="!text-center font-medium !text-[#ffffff] text-xl">
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(pixData.amount)}
                </Text>
              </div>

              <Text className="text-sm text-gray-600 text-center mb-4">
                1. Abra o app do seu banco
                <br />
                2. Escolha pagar via PIX
                <br />
                3. Escaneie o QR Code acima
              </Text>
            </div>
          </Card>

          {/* Código para copiar */}
          <Card className="w-full">
            <div className="p-4">
              <Text className="font-medium mb-2">Ou copie o código:</Text>

              <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-3">
                <Text className="text-xs break-all font-mono text-gray-700">
                  {pixData.qrCode}
                </Text>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <div className="flex items-center gap-2">
                    <img src={getIcons("check")} alt="Check" className="w-5 h-5" />
                    Código copiado!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    Copiar código PIX
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Informações */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CircleAlertIcon className="w-6 h-6 text-blue-400" />
              <div>
                <Text className="font-medium text-blue-700 mb-1">
                  Informações importantes:
                </Text>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• O pagamento é processado em até 2 minutos</li>
                  <li>• Você receberá uma confirmação quando o pagamento for aprovado</li>
                  <li>• O agendamento será confirmado automaticamente após o pagamento</li>
                  <li>• Mantenha esta tela aberta até o pagamento ser confirmado</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="max-w-80 m-auto h-14 w-full"
            onClick={handleFinish}
          >
            Já fiz o pagamento
          </Button>
        </div>
      </div>
    </Layout>
  );
};
