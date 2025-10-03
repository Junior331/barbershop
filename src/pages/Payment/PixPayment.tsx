// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import { Text, Title, Button } from "@/components/elements";
import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";

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

        <div className="flex flex-col w-full justify-between items-start gap-6 px-4 pb-24 overflow-auto h-[calc(100vh-0px)]">

          {/* Status */}
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="loading loading-spinner loading-md text-yellow-600"></div>
              <div>
                <Text className="font-medium text-yellow-800">
                  Aguardando pagamento...
                </Text>
                <Text className="text-sm text-yellow-700">
                  Escaneie o QR Code ou copie o código abaixo
                </Text>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <Card className="w-full">
            <div className="p-6 flex flex-col items-center">
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

              <div className="w-full bg-[#6C8762] bg-opacity-10 rounded-lg p-4 mb-4">
                <Text className="text-center font-medium text-[#6C8762] text-xl">
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
                    <img src={getIcons("copy")} alt="Copy" className="w-5 h-5" />
                    Copiar código PIX
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Informações */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <img
                src={getIcons("info")}
                alt="Info"
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <Text className="font-medium text-blue-800 mb-1">
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

          {/* Espaçador para botão fixo */}
          <div className="h-20" />
        </div>

        {/* Botão fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-6 px-4">
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
